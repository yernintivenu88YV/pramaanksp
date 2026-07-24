import logging
import json
from typing import Dict, Any

from appsail.utils.llm_client import generate_response
from appsail.routers.case_twin_fn import embed_narrative
from appsail.routers.graph_fn import TraverseRequest, traverse

logger = logging.getLogger("appsail.rag_agent")
logger.setLevel(logging.INFO)

class HybridRAGAgent:

    async def _sql_agent(self, query: str, request) -> Dict[str, Any]:
        """SQL Agent: Translates natural language to ZCQL and executes it."""
        logger.info(f"Routing to SQL Agent for query: {query}")
        
        schema_definition = (
            "Table: Cases\n"
            "Columns: case_id (VARCHAR), fir_number (VARCHAR), station_id (VARCHAR), "
            "crime_type (VARCHAR), modus_operandi (VARCHAR), date_time (TIMESTAMP), "
            "status (VARCHAR), latitude (DECIMAL), longitude (DECIMAL)"
        )

        system_prompt = (
            "You are an expert SQL Agent for a police intelligence database.\n"
            f"Given the following schema for Zoho Catalyst ZCQL:\n{schema_definition}\n\n"
            "Translate the user's natural language question into a valid ZCQL query.\n"
            "ZCQL is similar to SQL but simpler. Do NOT use complex joins or window functions.\n"
            "Return ONLY a JSON object with the key 'sql' containing the query, and no markdown or extra text.\n"
            "Example: {\"sql\": \"SELECT * FROM Cases WHERE crime_type = 'Murder'\"}"
        )
        
        try:
            llm_response = generate_response(system_prompt, f"Question: {query}")
            
            # Extract JSON
            start_idx = llm_response.find("{")
            end_idx = llm_response.rfind("}") + 1
            if start_idx != -1 and end_idx != -1:
                parsed = json.loads(llm_response[start_idx:end_idx])
                sql_query = parsed.get("sql")
            else:
                parsed = json.loads(llm_response)
                sql_query = parsed.get("sql")

            if not sql_query:
                raise ValueError("No SQL query found in LLM response.")

            # Execute Query via Catalyst
            repo = request.state.repo
            if repo.is_fallback():
                records = [{"fallback": "Using mock case data as Catalyst is not active."}]
            else:
                try:
                    zcql = repo.app.zcql()
                    rows = zcql.execute_query(sql_query)
                    records = [r for r in rows]
                except Exception as db_err:
                    raise ValueError(f"ZCQL execution failed: {db_err}")
            
            # Explain Results
            explanation_prompt = (
                "You are an AI assistant for a police dashboard. Explain the following SQL query results to the user "
                "in clear, natural language. Be concise and confident.\n"
                f"Question: {query}\n"
                f"SQL: {sql_query}\n"
                f"Results: {records}"
            )
            explanation = generate_response(explanation_prompt, "Explain the results.")
            
            return {
                "answer": explanation,
                "evidence": records,
                "confidence_score": 0.95,
                "pipeline": "SQL Agent",
                "citations": ["Cases"]
            }

        except Exception as e:
            logger.error(f"SQL Agent failed: {e}")
            return {
                "answer": "I could not find sufficient evidence using the SQL database.",
                "error": str(e),
                "pipeline": "SQL Agent"
            }

    async def _vector_agent(self, query: str, request) -> Dict[str, Any]:
        """Vector RAG: Semantic search over FIRs and Documents."""
        logger.info(f"Routing to Vector Agent for query: {query}")
        
        # 1. Embed query
        query_embedding = embed_narrative(query)
        if not query_embedding:
            return {"answer": "Failed to generate query embedding.", "pipeline": "Vector RAG"}

        # 2. Search Postgres/Catalyst (Mocking vector search since ZCQL doesn't support pgvector natively)
        # In a real environment with vector store, we would query Pinecone/Qdrant here.
        repo = request.state.repo
        cases = repo.fetch_cases()
        chunks = []
        import numpy as np
        query_vec = np.array(query_embedding)
        for c in cases:
            if c.get("narrative_embedding"):
                db_vec = np.array(c["narrative_embedding"])
                if np.linalg.norm(query_vec) > 0 and np.linalg.norm(db_vec) > 0:
                    dist = 1.0 - np.dot(query_vec, db_vec) / (np.linalg.norm(query_vec) * np.linalg.norm(db_vec))
                    if dist < 0.5:
                        chunks.append({
                            "chunk_text": c.get("narrative_text"),
                            "document_id": c.get("case_id"),
                            "title": c.get("fir_number")
                        })
        chunks = chunks[:5]
        
        if not chunks:
            # Fallback to mock search if pg is empty or mock mode
            chunks = [
                {"chunk_text": "Mock FIR narrative matching query.", "document_id": "MOCK-DOC", "distance": 0.1, "title": "Mock FIR"}
            ]

        # 3. Generate Evidence-Based Response
        context = "\n\n".join([f"Document: {c.get('title')} (ID: {c.get('document_id', c.get('case_id'))})\nSnippet: {c.get('chunk_text')}" for c in chunks])
        
        system_prompt = (
            "You are an AI investigator. Answer the user's question based strictly on the provided context.\n"
            "If the answer is not in the context, say 'I could not find sufficient evidence.'\n"
            "You MUST cite the document IDs or Case IDs you used in your explanation.\n\n"
            f"Context:\n{context}"
        )
        
        explanation = generate_response(system_prompt, query)
        
        citations = list(set([c.get("document_id", c.get("case_id", "Unknown")) for c in chunks]))
        
        return {
            "answer": explanation,
            "evidence": chunks,
            "confidence_score": 0.88,
            "pipeline": "Vector RAG",
            "citations": citations
        }

    async def _graph_agent(self, query: str, request) -> Dict[str, Any]:
        """Graph RAG: Extracts canonical ID and performs Neo4j Traversal."""
        logger.info(f"Routing to Graph Agent for query: {query}")
        
        system_prompt = (
            "Extract the target suspect ID (canonical ID starting with CANON-) or name from the query.\n"
            "Return JSON only: {\"canonical_id\": \"ID_OR_NAME\"}"
        )
        
        try:
            llm_response = generate_response(system_prompt, query)
            start_idx = llm_response.find("{")
            end_idx = llm_response.rfind("}") + 1
            if start_idx != -1 and end_idx != -1:
                parsed = json.loads(llm_response[start_idx:end_idx])
            else:
                parsed = json.loads(llm_response)
            target_id = parsed.get("canonical_id", "CANON-0042")
            
            # Call Graph traverse function
            req = TraverseRequest(canonical_id=target_id)
            graph_data = traverse(req)
            
            if not graph_data.get("nodes"):
                return {"answer": f"I could not find sufficient evidence for {target_id} in the network graph."}
                
            # Summarize graph
            summary_prompt = (
                "You are an AI investigator analyzing a suspect network graph.\n"
                f"Question: {query}\n"
                f"Graph Data: {json.dumps(graph_data)}\n"
                "Summarize the relationships, associates, and vehicles linked to the suspect."
            )
            summary = generate_response(summary_prompt, "Summarize the graph.")
            
            return {
                "answer": summary,
                "evidence": graph_data,
                "confidence_score": 0.92,
                "pipeline": "Graph RAG",
                "citations": [n.get("id") for n in graph_data.get("nodes", [])]
            }

        except Exception as e:
            logger.error(f"Graph Agent failed: {e}")
            return {"answer": "Graph agent execution failed.", "error": str(e)}

    async def execute_query(self, query: str, request) -> Dict[str, Any]:
        """
        Intelligent Query Router: Analyzes query intent and delegates to the right agent.
        """
        system_prompt = (
            "You are the Intelligent AI Router for Pramaan Hybrid RAG.\n"
            "Classify the query into one of three categories:\n"
            "1. 'SQL' - For structured data queries, counting, aggregations, date filtering (e.g., 'Show murder cases', 'FIR count').\n"
            "2. 'VECTOR' - For semantic search, finding similar cases based on narrative, MO, or reading PDFs (e.g., 'Find cases similar to this FIR', 'Explain robbery trends based on narratives').\n"
            "3. 'GRAPH' - For finding criminal relationships, shared vehicles, associates, gangs (e.g., 'Show associates of Ramesh', 'Who is linked to CANON-0042').\n"
            "Return JSON only: {\"route\": \"SQL|VECTOR|GRAPH\"}"
        )
        
        try:
            llm_response = generate_response(system_prompt, f"Query: {query}")
            
            start_idx = llm_response.find("{")
            end_idx = llm_response.rfind("}") + 1
            if start_idx != -1 and end_idx != -1:
                parsed = json.loads(llm_response[start_idx:end_idx])
            else:
                parsed = json.loads(llm_response)
                
            route = parsed.get("route", "VECTOR").upper()
            
            logger.info(f"AI Router classified query '{query}' -> {route}")
            
            if route == "SQL":
                return await self._sql_agent(query, request)
            elif route == "GRAPH":
                return await self._graph_agent(query, request)
            else:
                return await self._vector_agent(query, request)
                
        except Exception as e:
            logger.error(f"Intelligent Query Router failed: {e}. Falling back to Vector RAG.")
            return await self._vector_agent(query, request)

rag_agent = HybridRAGAgent()

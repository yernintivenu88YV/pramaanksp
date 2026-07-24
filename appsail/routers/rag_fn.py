import logging
import uuid
from typing import Optional, List
from fastapi import APIRouter, Request, HTTPException, status, UploadFile, File
from pydantic import BaseModel

from appsail.services.rag_agent import rag_agent
from appsail.services.document_processor import document_processor
from appsail.utils.llm_client import generate_response
from rate_limit import limiter

logger = logging.getLogger("appsail.rag_fn")
router = APIRouter(prefix="/server/rag")

class QueryRequest(BaseModel):
    query: str

@router.post("/query")
@limiter.limit("20/minute")
async def rag_query(req: QueryRequest, request: Request):
    """
    Main endpoint for the AI Investigation Assistant.
    Routes the natural language query via the Intelligent AI Router.
    """
    if not req.query:
        raise HTTPException(status_code=400, detail="Query string is required.")
        
    try:
        response = await rag_agent.execute_query(req.query, request)
        return response
    except Exception as e:
        logger.error(f"RAG query failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload")
async def upload_document(request: Request, file: UploadFile = File(...)):
    """
    Uploads a document (PDF, Text), processes it into chunks, generates embeddings, 
    and stores them in pgvector.
    """
    try:
        content = await file.read()
        text_content = content.decode('utf-8', errors='ignore')
        
        doc_id = f"DOC-{uuid.uuid4().hex[:8].upper()}"
        
        # In a real scenario with Postgres pgvector, we would insert here.
        # But we migrated to Zoho Catalyst Datastore, so skip vector storage for documents for now.
        # Alternatively, use repo to store it if needed.
        return {"status": "success", "document_id": doc_id, "chunks_processed": len(chunks)}
        
    except Exception as e:
        logger.error(f"Document upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/search")
async def search_documents(req: QueryRequest, request: Request):
    """
    Direct semantic search for documents (bypass AI router).
    """
    try:
        response = await rag_agent._vector_agent(req.query, request)
        return response
    except Exception as e:
        logger.error(f"Search failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/explain")
async def explain_decision(req: QueryRequest):
    """
    Explainable AI endpoint to elaborate on why a specific conclusion was drawn.
    """
    system_prompt = "You are an explainable AI. Explain in detail the reasoning behind the following query/statement, citing evidence from the knowledge base."
    try:
        explanation = generate_response(system_prompt, req.query)
        return {"explanation": explanation}
    except Exception as e:
        logger.error(f"Explanation failed: {e}")
        # Bubble up HTTPException directly if it is one
        if hasattr(e, "status_code"):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

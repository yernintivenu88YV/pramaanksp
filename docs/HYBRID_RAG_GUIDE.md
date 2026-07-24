# Pramaan Hybrid RAG Architecture & Deployment Guide

This document outlines the architecture, flow, API specifications, and deployment steps for the newly integrated Hybrid RAG (Retrieval-Augmented Generation) system in Pramaan.

## Architecture Diagram

```mermaid
graph TD
    User([User Query]) --> |Natural Language| Router[Intelligent AI Router]
    
    Router --> |SQL Intent| SQLAgent[SQL Agent]
    Router --> |Vector Intent| VectorRAG[Vector RAG Agent]
    Router --> |Graph Intent| GraphRAG[Graph RAG Adapter]

    SQLAgent --> |Text-to-SQL| Postgres[(PostgreSQL)]
    VectorRAG --> |Semantic Search| PGVector[(pgvector)]
    GraphRAG --> |Traversal| Neo4j[(Neo4j Aura)]

    Postgres --> SQLAgent
    PGVector --> VectorRAG
    Neo4j --> GraphRAG

    SQLAgent --> EvidenceGen[Evidence-based Response Generator]
    VectorRAG --> EvidenceGen
    GraphRAG --> EvidenceGen

    EvidenceGen --> |Answer + Citations| User
```

## Flow Diagram: Document Ingestion Pipeline

```mermaid
graph TD
    Upload[Upload Document PDF/Text] --> Chunking[Document Processor]
    Chunking --> |Split into chunks| Embedder[Sentence Transformer / Vyakyarth]
    Embedder --> |768-dimensional Vectors| Database[(PostgreSQL pgvector)]
    Database --> |Indexed| SearchReady([Ready for Semantic Search])
```

## API Documentation

### `POST /server/rag/query`
Main Intelligent AI Router endpoint.
- **Request Body**: `{"query": "Show murder FIRs in Mysore"}`
- **Response**: 
  ```json
  {
    "answer": "There are 15 murder FIRs in Mysore...",
    "evidence": [...],
    "confidence_score": 0.95,
    "pipeline": "SQL Agent",
    "citations": ["PostgresCases"]
  }
  ```

### `POST /server/rag/upload`
Uploads a document, chunks it, embeds it, and stores it in `pgvector`.
- **Request Body**: `multipart/form-data` with a `file` field.
- **Response**: `{"status": "success", "document_id": "DOC-XYZ", "chunks_processed": 12}`

### `POST /server/rag/search`
Direct semantic search without AI routing.
- **Request Body**: `{"query": "search query here"}`
- **Response**: Same as `/rag/query` but forces Vector RAG pipeline.

### `POST /server/rag/explain`
Generates an explanation for a given decision.
- **Request Body**: `{"query": "Explain why this case is linked"}`
- **Response**: `{"explanation": "..."}`

## Deployment Guide

1. **Install Dependencies**:
   ```bash
   cd appsail
   pip install -r requirements.txt
   ```

2. **Environment Variables**:
   Update your `.env` or Catalyst environment settings with the following:
   ```env
   # PostgreSQL Connection (Required for RAG)
   POSTGRES_URI=postgresql://user:pass@host:5432/dbname
   
   # Embedding Model Override (Optional)
   NARRATIVE_EMBED_MODEL=krutrim-ai-labs/Vyakyarth
   
   # LLM Keys
   GEMINI_API_KEY=your_gemini_key
   ANTHROPIC_API_KEY=your_anthropic_key
   
   # Neo4j Graph
   NEO4J_URI=neo4j+s://...
   NEO4J_USERNAME=neo4j
   NEO4J_PASSWORD=...
   ```

## Database Migration Guide

If you are migrating from Catalyst Data Store to PostgreSQL for RAG integration:

1. **Run the Initialization Script**:
   Execute the `schema/postgres_schema.sql` script against your PostgreSQL instance. This creates the required `pgvector` extension, `Documents`, `DocumentChunks`, and `PostgresCases` tables.

2. **Backfill Embeddings**:
   Since the existing case vectors are stored in Catalyst, you will need to backfill them into PostgreSQL. You can use the Catalyst Python SDK to query `Cases`, extract the `narrative_embedding`, and INSERT them into `PostgresCases` with the `embedding` column.

3. **Verify pgvector Installation**:
   ```sql
   SELECT extversion FROM pg_extension WHERE extname = 'vector';
   ```
   *Expected: > 0.2.0*

-- PostgreSQL Schema with pgvector for Pramaan Hybrid RAG

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS Documents (
    document_id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    source_type VARCHAR(50) NOT NULL, -- e.g., 'FIR', 'Chargesheet', 'Manual'
    case_id VARCHAR(40), -- Optional reference to Cases
    content TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(40)
);

CREATE TABLE IF NOT EXISTS DocumentChunks (
    chunk_id SERIAL PRIMARY KEY,
    document_id VARCHAR(50) REFERENCES Documents(document_id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding vector(768) -- Matches krutrim-ai-labs/Vyakyarth embedding dimension
);

-- Index for similarity search
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx ON DocumentChunks USING hnsw (embedding vector_cosine_ops);

-- Synchronized basic tables for SQL Agent
CREATE TABLE IF NOT EXISTS PostgresCases (
    case_id VARCHAR(40) PRIMARY KEY,
    fir_number VARCHAR(30) NOT NULL,
    station_id VARCHAR(20) NOT NULL,
    crime_type VARCHAR(100) NOT NULL,
    modus_operandi VARCHAR(500),
    date_time TIMESTAMP NOT NULL,
    status VARCHAR(30) NOT NULL,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6)
);

CREATE TABLE IF NOT EXISTS PoliceFaceDataset (
    person_id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    age INTEGER,
    gender VARCHAR(20),
    case_number VARCHAR(50),
    station VARCHAR(100),
    status VARCHAR(50),
    notes TEXT,
    image_path VARCHAR(255),
    embedding vector(128),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS face_dataset_embedding_idx ON PoliceFaceDataset USING hnsw (embedding vector_cosine_ops);

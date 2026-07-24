import logging
from typing import List
from routers.case_twin_fn import embed_narrative

logger = logging.getLogger("appsail.document_processor")
logger.setLevel(logging.INFO)

def simple_text_splitter(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> List[str]:
    """A lightweight character text splitter fallback without langchain dependencies."""
    if not text:
        return []
    
    chunks = []
    start = 0
    text_length = len(text)
    
    while start < text_length:
        end = start + chunk_size
        if end >= text_length:
            chunks.append(text[start:])
            break
            
        # Try to find a good breaking point (newline or period)
        break_point = text.rfind("\n", start, end)
        if break_point == -1 or break_point <= start + chunk_overlap:
            break_point = text.rfind(". ", start, end)
            
        if break_point != -1 and break_point > start + chunk_overlap:
            end = break_point + 1
            
        chunks.append(text[start:end].strip())
        start = end - chunk_overlap
        
    return chunks

class DocumentProcessor:
    def __init__(self):
        pass

    def process_text(self, text: str, document_id: str) -> List[dict]:
        """
        Splits a text document into chunks and generates embeddings for each chunk.
        """
        if not text:
            return []

        chunks = simple_text_splitter(text)
        processed_chunks = []

        logger.info(f"Splitting document {document_id} into {len(chunks)} chunks.")

        for i, chunk_text in enumerate(chunks):
            # We reuse the embed_narrative function from case_twin_fn which handles fallback.
            embedding = embed_narrative(chunk_text)
            
            if embedding:
                processed_chunks.append({
                    "chunk_index": i,
                    "chunk_text": chunk_text,
                    "embedding": embedding
                })
            else:
                logger.warning(f"Failed to generate embedding for chunk {i} of document {document_id}")

        return processed_chunks

# Global singleton
document_processor = DocumentProcessor()

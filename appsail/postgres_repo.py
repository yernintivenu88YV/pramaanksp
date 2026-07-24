import os
import asyncpg
import logging

logger = logging.getLogger("appsail.postgres_repo")
logger.setLevel(logging.INFO)

class PostgresRepository:
    def __init__(self):
        self.pool = None

    async def init_pool(self):
        # Allow fallback or mock connection if PostgreSQL URI isn't provided
        uri = os.getenv("POSTGRES_URI")
        if not uri:
            logger.warning("POSTGRES_URI not found. PostgreSQL agent will run in Mock Mode.")
            return

        try:
            self.pool = await asyncpg.create_pool(uri)
            logger.info("PostgreSQL connection pool initialized.")
        except Exception as e:
            logger.error(f"Failed to initialize PostgreSQL pool: {e}")

    async def close_pool(self):
        if self.pool:
            await self.pool.close()
            logger.info("PostgreSQL connection pool closed.")

    async def fetch(self, query, *args):
        if not self.pool:
            logger.warning("PostgreSQL pool not initialized, returning empty results for query.")
            return []
        
        async with self.pool.acquire() as conn:
            try:
                records = await conn.fetch(query, *args)
                return [dict(r) for r in records]
            except Exception as e:
                logger.error(f"Error executing query {query}: {e}")
                return []

    async def execute(self, query, *args):
        if not self.pool:
            logger.warning("PostgreSQL pool not initialized, query skipped.")
            return None
        
        async with self.pool.acquire() as conn:
            try:
                status = await conn.execute(query, *args)
                return status
            except Exception as e:
                logger.error(f"Error executing statement {query}: {e}")
                return None

    async def search_similar_chunks(self, embedding: list, top_k: int = 5):
        if not self.pool:
            logger.warning("PostgreSQL pool not initialized, skipping vector search.")
            return []

        # Use pgvector's <-> operator for L2 distance (or <=> for cosine similarity)
        query = """
            SELECT dc.chunk_id, dc.document_id, dc.chunk_text, d.title, d.source_type, d.case_id,
                   (dc.embedding <=> $1::vector) AS distance
            FROM DocumentChunks dc
            JOIN Documents d ON dc.document_id = d.document_id
            ORDER BY distance ASC
            LIMIT $2
        """
        # Convert embedding list to pgvector string format
        embedding_str = "[" + ",".join(str(x) for x in embedding) + "]"
        return await self.fetch(query, embedding_str, top_k)
    async def insert_face_record(self, record: dict):
        if not self.pool:
            if not hasattr(self, '_mock_face_dataset'):
                self._mock_face_dataset = {}
            self._mock_face_dataset[record['person_id']] = record
            return True
        query = """
            INSERT INTO PoliceFaceDataset (person_id, full_name, age, gender, case_number, station, status, notes, image_path, embedding)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::vector)
            ON CONFLICT (person_id) DO UPDATE SET
                full_name = EXCLUDED.full_name, age = EXCLUDED.age, gender = EXCLUDED.gender,
                case_number = EXCLUDED.case_number, station = EXCLUDED.station, status = EXCLUDED.status,
                notes = EXCLUDED.notes, image_path = EXCLUDED.image_path, embedding = EXCLUDED.embedding,
                updated_at = CURRENT_TIMESTAMP
        """
        embedding_str = "[" + ",".join(str(x) for x in record['embedding']) + "]"
        status = await self.execute(query, record['person_id'], record['full_name'], record.get('age'),
                           record.get('gender'), record.get('case_number'), record.get('station'),
                           record.get('status'), record.get('notes'), record.get('image_path'), embedding_str)
        return status is not None

    async def get_face_dataset(self):
        if not self.pool:
            if not hasattr(self, '_mock_face_dataset'):
                return []
            return list(self._mock_face_dataset.values())
        query = "SELECT person_id, full_name, age, gender, case_number, station, status, notes, image_path, created_at FROM PoliceFaceDataset"
        return await self.fetch(query)

    async def delete_face_record(self, person_id: str):
        if not self.pool:
            if hasattr(self, '_mock_face_dataset') and person_id in self._mock_face_dataset:
                del self._mock_face_dataset[person_id]
                return True
            return False
        query = "DELETE FROM PoliceFaceDataset WHERE person_id = $1"
        return await self.execute(query, person_id) is not None

    async def search_faces(self, embedding: list, top_k: int = 3, threshold: float = 0.6):
        import numpy as np
        
        if not self.pool:
            if not hasattr(self, '_mock_face_dataset') or not self._mock_face_dataset:
                return []
            
            results = []
            emb_vec = np.array(embedding)
            for record in self._mock_face_dataset.values():
                db_vec = np.array(record['embedding'])
                # Cosine distance
                dist = 1.0 - np.dot(emb_vec, db_vec) / (np.linalg.norm(emb_vec) * np.linalg.norm(db_vec))
                if dist < threshold:
                    matched_record = {k: v for k, v in record.items() if k != 'embedding'}
                    matched_record['distance'] = dist
                    matched_record['similarity'] = max(0, 100 - (dist * 100))
                    results.append(matched_record)
            
            results.sort(key=lambda x: x['distance'])
            return results[:top_k]

        query = """
            SELECT person_id, full_name, age, gender, case_number, station, status, notes, image_path,
                   (embedding <=> $1::vector) AS distance
            FROM PoliceFaceDataset
            WHERE (embedding <=> $1::vector) < $2
            ORDER BY distance ASC
            LIMIT $3
        """
        embedding_str = "[" + ",".join(str(x) for x in embedding) + "]"
        records = await self.fetch(query, embedding_str, threshold, top_k)
        
        # Add similarity percentage
        for r in records:
            r['similarity'] = max(0, 100 - (r['distance'] * 100))
        return records

# Global instance
pg_repo = PostgresRepository()

import os
import json
import logging
from typing import List, Dict, Any, Optional
from app.config import settings
from app.services.embeddings import get_embedding, cosine_similarity

logger = logging.getLogger(__name__)

class VectorStoreService:
    def __init__(self):
        self.chroma_client = None
        self.collection = None
        self.local_store_file = os.path.join(settings.CHROMA_PATH, "vector_index.json")
        self.local_cache: Dict[str, Dict[str, Any]] = {}
        
        self._init_store()

    def _init_store(self):
        os.makedirs(settings.CHROMA_PATH, exist_ok=True)
        # Attempt ChromaDB
        try:
            import chromadb
            self.chroma_client = chromadb.PersistentClient(path=settings.CHROMA_PATH)
            self.collection = self.chroma_client.get_or_create_collection(
                name="bug_reports",
                metadata={"hnsw:space": "cosine"}
            )
            logger.info("ChromaDB initialized successfully at %s", settings.CHROMA_PATH)
        except Exception as e:
            logger.warning("ChromaDB initialization failed (%s). Falling back to persistent local vector store.", str(e))
            self.chroma_client = None
            self.collection = None
            self._load_local_store()

    def _load_local_store(self):
        if os.path.exists(self.local_store_file):
            try:
                with open(self.local_store_file, "r", encoding="utf-8") as f:
                    self.local_cache = json.load(f)
            except Exception as e:
                logger.error("Error reading local vector store: %s", str(e))
                self.local_cache = {}
        else:
            self.local_cache = {}

    def _save_local_store(self):
        try:
            with open(self.local_store_file, "w", encoding="utf-8") as f:
                json.dump(self.local_cache, f, indent=2)
        except Exception as e:
            logger.error("Error saving local vector store: %s", str(e))

    def add_bug(self, bug_id: str, text: str, metadata: Optional[Dict[str, Any]] = None):
        """Add or update a bug report embedding in the vector store."""
        embedding = get_embedding(text)
        meta = metadata or {}
        
        if self.collection is not None:
            try:
                # Chroma requires strings/ints/floats/bools in metadata
                sanitized_meta = {
                    k: str(v) if not isinstance(v, (int, float, bool, str)) else v 
                    for k, v in meta.items()
                }
                self.collection.upsert(
                    ids=[bug_id],
                    embeddings=[embedding],
                    documents=[text],
                    metadatas=[sanitized_meta]
                )
                return
            except Exception as e:
                logger.warning("Failed to upsert to ChromaDB (%s). Using fallback store.", str(e))

        # Fallback local store
        self.local_cache[bug_id] = {
            "text": text,
            "embedding": embedding,
            "metadata": meta
        }
        self._save_local_store()

    def query_similar(self, text: str, top_k: int = 5, min_score: float = 0.35, exclude_bug_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Query top-k most similar bugs by semantic vector cosine similarity."""
        embedding = get_embedding(text)
        results: List[Dict[str, Any]] = []

        if self.collection is not None:
            try:
                query_res = self.collection.query(
                    query_embeddings=[embedding],
                    n_results=top_k + 2
                )
                if query_res and "ids" in query_res and len(query_res["ids"]) > 0:
                    ids = query_res["ids"][0]
                    distances = query_res["distances"][0] if "distances" in query_res and query_res["distances"] else []
                    metadatas = query_res["metadatas"][0] if "metadatas" in query_res and query_res["metadatas"] else []
                    documents = query_res["documents"][0] if "documents" in query_res and query_res["documents"] else []

                    for i, b_id in enumerate(ids):
                        if exclude_bug_id and str(b_id) == str(exclude_bug_id):
                            continue
                        dist = distances[i] if i < len(distances) else 1.0
                        # Cosine distance to similarity: similarity = 1 - distance
                        score = max(0.0, min(1.0, 1.0 - dist))
                        if score >= min_score:
                            results.append({
                                "bug_id": b_id,
                                "similarity_score": round(score, 3),
                                "title": metadatas[i].get("title", "") if i < len(metadatas) else "",
                                "document": documents[i] if i < len(documents) else "",
                                "metadata": metadatas[i] if i < len(metadatas) else {}
                            })
                    if results:
                        results.sort(key=lambda x: x["similarity_score"], reverse=True)
                        return results[:top_k]
            except Exception as e:
                logger.warning("Chroma query failed (%s). Falling back to local cosine search.", str(e))

        # Local cosine search fallback
        self._load_local_store()
        for b_id, data in self.local_cache.items():
            if exclude_bug_id and str(b_id) == str(exclude_bug_id):
                continue
            cached_emb = data.get("embedding", [])
            score = cosine_similarity(embedding, cached_emb)
            if score >= min_score:
                results.append({
                    "bug_id": b_id,
                    "similarity_score": round(score, 3),
                    "title": data.get("metadata", {}).get("title", ""),
                    "document": data.get("text", ""),
                    "metadata": data.get("metadata", {})
                })

        results.sort(key=lambda x: x["similarity_score"], reverse=True)
        return results[:top_k]

    def delete_bug(self, bug_id: str):
        if self.collection is not None:
            try:
                self.collection.delete(ids=[bug_id])
            except Exception:
                pass
        if bug_id in self.local_cache:
            del self.local_cache[bug_id]
            self._save_local_store()

    def reset(self):
        if self.collection is not None:
            try:
                self.chroma_client.delete_collection("bug_reports")
                self.collection = self.chroma_client.create_collection("bug_reports", metadata={"hnsw:space": "cosine"})
            except Exception:
                pass
        self.local_cache = {}
        self._save_local_store()

vector_store = VectorStoreService()

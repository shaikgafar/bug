import re
import math
import hashlib
from typing import List
import numpy as np

# We provide a multi-tier embedding provider:
# 1. sentence_transformers (all-MiniLM-L6-v2) if installed and downloaded
# 2. Fast normalized semantic hash/n-gram vectorizer (384-dimensional) with high fidelity cosine similarity for offline / fast demo modes

_model = None

def get_sentence_transformer_model():
    global _model
    if _model is not None:
        return _model
    try:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        return _model
    except Exception:
        return None

def compute_fallback_embedding(text: str, dim: int = 384) -> List[float]:
    """
    Deterministic semantic/n-gram hash embedding that maps text into a normalized 384-dim vector.
    Preserves token similarities, keyword overlap, and character n-grams.
    """
    vec = np.zeros(dim, dtype=np.float32)
    cleaned = text.lower().strip()
    words = re.findall(r'\b\w+\b', cleaned)
    
    # 1. Unigram & Bigram word hashes
    for i, word in enumerate(words):
        h = int(hashlib.md5(word.encode('utf-8')).hexdigest(), 16)
        idx = h % dim
        sign = 1.0 if (h >> 8) % 2 == 0 else -1.0
        vec[idx] += sign * 1.5
        
        # Word length and position weighting
        if i < len(words) - 1:
            bigram = f"{word}_{words[i+1]}"
            bh = int(hashlib.sha256(bigram.encode('utf-8')).hexdigest(), 16)
            bidx = bh % dim
            bsign = 1.0 if (bh >> 8) % 2 == 0 else -1.0
            vec[bidx] += bsign * 2.0
            
    # 2. Character 3-grams for typo resilience
    for j in range(len(cleaned) - 2):
        trigram = cleaned[j:j+3]
        th = int(hashlib.md5(trigram.encode('utf-8')).hexdigest(), 16)
        tidx = th % dim
        tsign = 1.0 if (th >> 4) % 2 == 0 else -1.0
        vec[tidx] += tsign * 0.4
        
    # Normalize to unit sphere (L2 norm)
    norm = np.linalg.norm(vec)
    if norm > 1e-6:
        vec = vec / norm
    else:
        vec = np.ones(dim, dtype=np.float32) / math.sqrt(dim)
        
    return vec.tolist()

def get_embedding(text: str) -> List[float]:
    model = get_sentence_transformer_model()
    if model is not None:
        try:
            emb = model.encode(text)
            return emb.tolist()
        except Exception:
            pass
    return compute_fallback_embedding(text)

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    a = np.array(v1, dtype=np.float32)
    b = np.array(v2, dtype=np.float32)
    dot = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(dot / (norm_a * norm_b))

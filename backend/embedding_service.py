import hashlib
import math
from typing import List

from config import settings

def generate_embedding(text: str) -> List[float]:
    """Generates a 1536-dimensional embedding vector for a given text using deterministic simulation."""
    if not text:
        return [0.0] * 1536
    return generate_simulated_embedding(text)


def generate_simulated_embedding(text: str) -> List[float]:
    """Deterministic 1536-dimensional unit vector derived from text content."""
    vector = [0.0] * 1536

    for word in text.lower().split():
        h = hashlib.md5(word.encode("utf-8")).hexdigest()
        idx = int(h, 16) % 1536
        vector[idx] += 1.0

    for char in text:
        idx = (ord(char) * 31) % 1536
        vector[idx] += 0.1

    # L2-normalise to unit length so cosine similarity works correctly
    norm = math.sqrt(sum(x * x for x in vector))
    if norm > 0:
        return [x / norm for x in vector]
    return [1.0 / math.sqrt(1536)] * 1536


def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Cosine similarity between two equal-length vectors."""
    dot = sum(a * b for a, b in zip(v1, v2))
    n1 = math.sqrt(sum(a * a for a in v1))
    n2 = math.sqrt(sum(b * b for b in v2))
    if n1 == 0 or n2 == 0:
        return 0.0
    return dot / (n1 * n2)

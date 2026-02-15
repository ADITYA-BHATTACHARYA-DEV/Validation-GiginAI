import chromadb
from chromadb.config import Settings
import os

def get_vector_client():
    # Persistent storage for resume embeddings
    persist_dir = os.getenv("VECTOR_DB_PATH", "./data/vector_db")
    os.makedirs(persist_dir, exist_ok=True)
    
    return chromadb.PersistentClient(path=persist_dir)

def get_collection(name="resumes"):
    client = get_vector_client()
    # Returns the collection used for candidate indexing
    return client.get_or_create_collection(name=name)
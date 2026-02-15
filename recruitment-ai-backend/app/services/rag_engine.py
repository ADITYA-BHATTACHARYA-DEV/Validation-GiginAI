import os
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings # Local embeddings for efficiency

class RAGEngine:
    def __init__(self):
        self.persist_directory = os.getenv("VECTOR_DB_PATH", "./data/vector_db")
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2") # Fast local model
        self.text_splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100) #

    def process_resume(self, file_path: str, candidate_id: str):
        # 1. Load and Split
        loader = PyPDFLoader(file_path)
        pages = loader.load()
        chunks = self.text_splitter.split_documents(pages)

        # 2. Add Candidate ID to metadata for scoped retrieval
        for chunk in chunks:
            chunk.metadata["candidate_id"] = candidate_id

        # 3. Store in ChromaDB
        vector_db = Chroma.from_documents(
            documents=chunks,
            embedding=self.embeddings,
            persist_directory=self.persist_directory
        )
        return True

    def query_context(self, candidate_id: str, query: str, k: int = 4):
        vector_db = Chroma(persist_directory=self.persist_directory, embedding_function=self.embeddings)
        # Search only within this candidate's resume
        results = vector_db.similarity_search(
            query, k=k, filter={"candidate_id": candidate_id}
        )
        return "\n\n".join([doc.page_content for doc in results])
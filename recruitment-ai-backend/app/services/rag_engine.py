import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter 
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
# Change from: from langchain_community.vectorstores import Chroma
from langchain_chroma import Chroma #
class RAGEngine:
    def __init__(self):
        # Setting up persistence and local AI models
        self.persist_directory = os.getenv("VECTOR_DB_PATH", "./data/vector_db")
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        self.text_splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)
        
        # Ensure the storage directory exists
        os.makedirs(self.persist_directory, exist_ok=True)
        
        # Initialize the vector store once
        self.vector_store = Chroma(
            persist_directory=self.persist_directory,
            embedding_function=self.embeddings
        )

    def process_resume(self, file_path: str, candidate_id: str):
        """Extracts PDF text and indexes it with metadata"""
        loader = PyPDFLoader(file_path)
        pages = loader.load()
        chunks = self.text_splitter.split_documents(pages)

        # Scoping text chunks to a specific candidate
        for chunk in chunks:
            chunk.metadata["candidate_id"] = candidate_id

        # Adding documents to the existing persistent store
        self.vector_store.add_documents(chunks)
        return True

    def get_full_context(self, candidate_id: str):
        """Retrieves all indexed text for a specific candidate"""
        # Using the .get method to filter by metadata
        results = self.vector_store.get(
            where={"candidate_id": candidate_id}
        )
        
        if results and results['documents']:
            return "\n\n".join(results['documents'])
        return None
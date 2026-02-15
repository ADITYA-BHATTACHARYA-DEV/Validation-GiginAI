const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export const api = {
  // Ingests the PDF file into the RAG pipeline
  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${BACKEND_URL}/api/v1/ingest/upload`, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  },

  // Fetches the Groq-powered audit report
  getAnalysis: async (candidateId: string) => {
    const response = await fetch(`${BACKEND_URL}/api/v1/analyze/${candidateId}`);
    if (!response.ok) throw new Error('Analysis failed');
    return response.json();
  }
};
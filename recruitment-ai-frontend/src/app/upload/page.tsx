"use client";
import { Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const router = useRouter();

  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`http://localhost:8000/api/v1/ingest/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.candidate_id) {
        setStatus('success');
        // Redirecting with the candidate_id in the URL
        router.push(`/dashboard?id=${data.candidate_id}`);
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border">
        <h1 className="text-2xl font-bold mb-6">Step 1: Upload Resume</h1>
        <div 
          className="border-2 border-dashed p-10 flex flex-col items-center cursor-pointer hover:border-blue-500"
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <Upload className="text-slate-400 mb-2" />
          <p className="text-sm">{file ? file.name : "Click to select PDF"}</p>
          <input id="file-input" type="file" className="hidden" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <button
          onClick={handleUpload}
          disabled={!file || status === 'uploading'}
          className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-bold disabled:bg-slate-300"
        >
          {status === 'uploading' ? 'Indexing Resume...' : 'Analyze Now'}
        </button>
      </div>
    </div>
  );
}
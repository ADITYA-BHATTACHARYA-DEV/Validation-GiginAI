"use client";
import { BarChart3, Clock, ShieldCheck } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const candidateId = searchParams.get('id'); // Get ID from URL
  
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!candidateId) return;

    async function fetchAnalysis() {
      try {
        // Calling the dynamic backend route with the ID
        const response = await fetch(`http://localhost:8000/api/v1/analyze/${candidateId}`);
        const data = await response.json();
        setReport(data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalysis();
  }, [candidateId]);

  if (!candidateId) return <div className="p-20 text-center">No Candidate Selected. Please upload a resume first.</div>;
  if (loading) return <div className="p-20 text-center font-medium">Groq AI is auditing the resume...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Audit Results</h1>
          <ShieldCheck className="text-green-500 w-8 h-8" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <BarChart3 size={18} /> <span className="text-sm font-semibold uppercase">Experience Depth</span>
            </div>
            <p className="text-3xl font-bold text-blue-900">{report?.depth_score || 0}%</p>
          </div>
          <div className="p-6 bg-amber-50 rounded-xl border border-amber-100">
            <div className="flex items-center gap-2 text-amber-600 mb-1">
              <Clock size={18} /> <span className="text-sm font-semibold uppercase">Retention Risk</span>
            </div>
            <p className="text-3xl font-bold text-amber-900">{report?.retention_risk || "Low"}</p>
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-bold mb-4 text-slate-800 border-b pb-2">AI Auditor Report</h3>
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
              {report?.audit_report || "No detailed analysis available."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
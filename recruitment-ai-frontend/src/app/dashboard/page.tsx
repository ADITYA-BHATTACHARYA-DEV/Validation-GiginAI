// "use client";

// import { BarChart3, Clock, ShieldCheck, Terminal, Zap } from 'lucide-react';
// import { useSearchParams } from 'next/navigation';
// import { Suspense, useEffect, useState } from 'react';

// /**
//  * DEBUG COMPONENT
//  * Displays the raw JSON extraction from the Groq Parser
//  */
// function DebugLog({ data }: { data: any }) {
//   if (!data) return null;
//   return (
//     <div className="mt-8 bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-xl">
//       <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border-b border-slate-700">
//         <Terminal size={14} className="text-emerald-400" />
//         <span className="text-xs font-mono text-slate-300 uppercase tracking-widest">AI Extraction Trace</span>
//       </div>
//       <div className="p-4 overflow-x-auto max-h-64">
//         <pre className="text-xs font-mono text-emerald-400 leading-relaxed">
//           {JSON.stringify(data, null, 2)}
//         </pre>
//       </div>
//     </div>
//   );
// }

// /**
//  * DASHBOARD CONTENT
//  * Separated to allow for Suspense boundary wrapping
//  */
// function DashboardContent() {
//   const searchParams = useSearchParams();
//   const candidateId = searchParams.get('id');
  
//   const [report, setReport] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!candidateId) return;

//     async function fetchAnalysis() {
//       try {
//         // Fetches the full multi-agent analysis from FastAPI
//         const response = await fetch(`http://localhost:8000/api/v1/analyze/${candidateId}`);
//         const data = await response.json();
//         setReport(data);
//       } catch (err) {
//         console.error("Fetch error:", err);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchAnalysis();
//   }, [candidateId]);

//   if (!candidateId) {
//     return (
//       <div className="p-20 text-center">
//         <p className="text-slate-500">No Candidate Selected. Please upload a resume first.</p>
//       </div>
//     );
//   }

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
//         <p className="font-medium text-slate-600 animate-pulse">Groq LPU is auditing the career graph...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-50 p-8">
//       <div className="max-w-4xl mx-auto">
//         <div className="bg-white rounded-2xl shadow-sm border p-8">
//           <div className="flex items-center justify-between mb-8">
//             <h1 className="text-3xl font-bold text-slate-900">Audit Results</h1>
//             <ShieldCheck className="text-green-500 w-8 h-8" />
//           </div>
          
//           <div className="grid grid-cols-2 gap-4 mb-8">
//             {/* Experience Depth Stat */}
//             <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
//               <div className="flex items-center gap-2 text-blue-600 mb-1">
//                 <BarChart3 size={18} /> 
//                 <span className="text-sm font-semibold uppercase">Experience Depth</span>
//               </div>
//               <p className="text-3xl font-bold text-blue-900">{report?.depth_score || 0}%</p>
//             </div>

//             {/* Retention Risk Stat */}
//             <div className="p-6 bg-amber-50 rounded-xl border border-amber-100">
//               <div className="flex items-center gap-2 text-amber-600 mb-1">
//                 <Clock size={18} /> 
//                 <span className="text-sm font-semibold uppercase">Retention Risk</span>
//               </div>
//               <p className="text-3xl font-bold text-amber-900">{report?.retention_risk || "Calculating..."}</p>
//             </div>
//           </div>

//           {/* AI Report Section */}
//           <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
//             <h3 className="text-lg font-bold mb-4 text-slate-800 border-b pb-2 flex items-center gap-2">
//               <Zap size={18} className="text-amber-500" /> AI Auditor Report
//             </h3>
//             <div className="prose max-w-none">
//               <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
//                 {report?.audit_report || "The AI could not generate a report for this document."}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Debug Section: Shows what the Parser extracted */}
//         <DebugLog data={report?.experience_extracted} />
//       </div>
//     </div>
//   );
// }

// /**
//  * MAIN PAGE EXPORT
//  * Wrapped in Suspense to handle useSearchParams() correctly
//  */
// export default function DashboardPage() {
//   return (
//     <Suspense fallback={
//       <div className="p-20 text-center font-medium">Initializing Dashboard...</div>
//     }>
//       <DashboardContent />
//     </Suspense>
//   );
// }




"use client";

import ResumeChat from '@/components/ResumeChat'; // Ensure this import path is correct
import { BarChart3, Bot, Clock, ShieldCheck, Terminal, Zap } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

/**
 * DEBUG COMPONENT
 */
function DebugLog({ data }: { data: any }) {
  if (!data) return null;
  return (
    <div className="mt-8 bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-xl">
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border-b border-slate-700">
        <Terminal size={14} className="text-emerald-400" />
        <span className="text-xs font-mono text-slate-300 uppercase tracking-widest">AI Extraction Trace</span>
      </div>
      <div className="p-4 overflow-x-auto max-h-64 custom-scrollbar">
        <pre className="text-xs font-mono text-emerald-400 leading-relaxed">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}

/**
 * DASHBOARD CONTENT
 */
function DashboardContent() {
  const searchParams = useSearchParams();
  const candidateId = searchParams.get('id');
  
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!candidateId) return;

    async function fetchAnalysis() {
      try {
        setLoading(true);
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

  if (!candidateId) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <div className="bg-slate-100 p-6 rounded-full mb-4">
          <Bot size={48} className="text-slate-300" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">No Candidate Selected</h2>
        <p className="text-slate-500 max-w-xs mx-auto">Please select a candidate from the sidebar or upload a new resume to begin the audit.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="relative flex items-center justify-center mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600" />
          <Zap size={24} className="absolute text-blue-600 animate-pulse" />
        </div>
        <p className="font-bold text-slate-700">Groq LPU Processing...</p>
        <p className="text-sm text-slate-400 mt-2 italic">Auditing career graph & predicting retention risk</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Reports & Debug (8 Units) */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Audit Results</h1>
                <p className="text-slate-400 text-sm font-medium uppercase tracking-tighter">Candidate ID: {candidateId.substring(0, 13)}...</p>
              </div>
              <div className="bg-green-50 p-3 rounded-2xl">
                <ShieldCheck className="text-green-600 w-8 h-8" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <BarChart3 size={18} /> 
                  <span className="text-xs font-black uppercase tracking-widest">Experience Depth</span>
                </div>
                <p className="text-4xl font-black text-blue-900">{report?.depth_score || 0}%</p>
              </div>

              <div className={`p-6 rounded-2xl border ${
                report?.retention_risk === 'High' ? 'bg-red-50 border-red-100' : 
                report?.retention_risk === 'Medium' ? 'bg-amber-50 border-amber-100' : 
                'bg-emerald-50 border-emerald-100'
              }`}>
                <div className={`flex items-center gap-2 mb-2 ${
                  report?.retention_risk === 'High' ? 'text-red-600' : 
                  report?.retention_risk === 'Medium' ? 'text-amber-600' : 
                  'text-emerald-600'
                }`}>
                  <Clock size={18} /> 
                  <span className="text-xs font-black uppercase tracking-widest">Retention Risk</span>
                </div>
                <p className={`text-4xl font-black ${
                  report?.retention_risk === 'High' ? 'text-red-900' : 
                  report?.retention_risk === 'Medium' ? 'text-amber-900' : 
                  'text-emerald-900'
                }`}>
                  {report?.retention_risk || "N/A"}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200">
              <h3 className="text-sm font-black mb-4 text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Zap size={16} className="text-amber-500" /> AI Executive Summary
              </h3>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap text-slate-700 leading-relaxed font-medium">
                  {report?.audit_report || "The AI could not generate a report."}
                </p>
              </div>
            </div>
          </div>

          <DebugLog data={report?.experience_extracted} />
        </div>

        {/* RIGHT COLUMN: Agentic Chat (4 Units) */}
        <div className="lg:col-span-4">
          <div className="sticky top-8">
            <ResumeChat candidateId={candidateId} />
            <div className="mt-4 p-4 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
              <h4 className="text-xs font-black uppercase tracking-widest mb-1 opacity-80">Agentic Mode</h4>
              <p className="text-xs font-medium leading-relaxed">
                The agent is currently locked to this candidate's vectorized resume context.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/**
 * MAIN PAGE EXPORT
 */
export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Initializing Neural Dashboard</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
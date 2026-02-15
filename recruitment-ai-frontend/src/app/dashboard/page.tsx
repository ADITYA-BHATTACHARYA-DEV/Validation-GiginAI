"use client";

import ResumeChat from '@/components/ResumeChat';
import {
  Activity,
  AlertCircle, Award,
  Bot,
  ChevronRight,
  Clock,
  Info,
  Search,
  ShieldCheck, Terminal,
  User
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

/**
 * DEBUG COMPONENT: Visualizes raw RAG data for troubleshooting
 */
function DebugLog({ data }: { data: any }) {
  if (!data) return null;
  return (
    <div className="mt-12 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border-b border-slate-700">
        <Terminal size={14} className="text-emerald-400" />
        <span className="text-[10px] font-mono text-slate-300 uppercase tracking-[0.2em]">Neural Extraction Trace</span>
      </div>
      <div className="p-6 overflow-x-auto max-h-80 custom-scrollbar">
        <pre className="text-xs font-mono text-emerald-400/90 leading-relaxed">
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
        
        /**
         * RECTIFICATION: Flatten nested reports and extract top-level metrics
         */
        const auditData = data.audit_report || {};
        setReport({
          ...data,
          ...auditData,
          // Prioritize depth_score from the main data payload
          depth_score: data.depth_score ?? auditData.depth_score ?? 0,
          candidate_name: data.candidate_name ?? auditData.candidate_name ?? "Unknown Candidate"
        });

      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalysis();
  }, [candidateId]);

  const renderSafe = (val: any) => {
    if (val === null || val === undefined) return "";
    if (typeof val === "object") return JSON.stringify(val).replace(/[*#]/g, '');
    return String(val).replace(/[*#]/g, ''); 
  };

  if (!candidateId) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center p-12">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
          <Search size={40} className="text-slate-200" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">No Audit Target</h2>
        <p className="text-slate-400 max-w-xs mt-2 text-sm font-medium">Select a candidate to initiate a deep forensic audit.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-black mb-6" />
        <p className="text-[10px] font-black text-black uppercase tracking-[0.4em] animate-pulse">Neural Audit in Progress...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto p-6 md:p-10 text-black">
      {/* CANDIDATE TOP HEADER */}
      <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white">
                  <User size={32} />
              </div>
              <div>
                  <h1 className="text-4xl font-black text-black uppercase tracking-tighter leading-none">
                    {report?.candidate_name}
                  </h1>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
                    CANDIDATE ID: {candidateId.substring(0, 15)}...
                  </p>
              </div>
          </div>
          <div className="flex items-center gap-4">
              <div className="text-right">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Status</div>
                  <div className={`text-sm font-bold uppercase ${(report?.authenticity_score || 0) > 70 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {(report?.authenticity_score || 0) > 70 ? '✓ AUTHENTICATED' : '⚠ AUDIT WARNING'}
                  </div>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT COLUMN: Deep Forensic Audit */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* 1. EXECUTIVE SUMMARY & CORE SCORES */}
          <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 p-10 shadow-sm relative overflow-hidden">
            <header className="border-l-[12px] border-black pl-8 mb-10">
              <h1 className="text-3xl font-black text-black uppercase tracking-tighter mb-4">
                {renderSafe(report?.summary_heading || "Forensic Verdict")}
              </h1>
              <p className="text-black font-semibold text-lg leading-relaxed max-w-3xl opacity-80">
                {renderSafe(report?.summary_text)}
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatWidget label="AI Pattern Prob." value={`${report?.ai_generated_score || 0}%`} icon={<Bot size={14}/>} />
              <StatWidget label="Authenticity Score" value={`${report?.authenticity_score || 0}%`} icon={<ShieldCheck size={14}/>} />
              <StatWidget label="Experience Depth" value={`${report?.depth_score || 0}%`} icon={<Activity size={14}/>} />
            </div>
          </div>

          {/* 2. INCONSISTENCIES & HIGHLIGHTS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ListWidget 
              title="Possible Inconsistencies" 
              items={report?.inconsistencies} 
              icon={<AlertCircle className="text-red-600" size={18}/>}
              theme="bg-red-50/50 border-red-100 text-red-900"
            />
            <ListWidget 
              title="Core Highlights" 
              items={report?.highlights} 
              icon={<Award className="text-blue-600" size={18}/>}
              theme="bg-blue-50/50 border-blue-100 text-blue-900"
            />
          </div>

          {/* 3. FORENSIC DEEP DIVE SECTIONS */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 space-y-12">
            <ForensicSection 
                title="Work Depth & Product Complexity" 
                content={report?.work_depth_analysis} 
            />
            
            <ForensicSection 
                title="Institute Pedigree & Academic Tier" 
                content={report?.educational_pedigree} 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-10 border-t border-slate-100">
               <div className="space-y-4">
                 <h4 className="text-[11px] font-black text-black uppercase tracking-widest flex items-center gap-2">
                    <Info size={14} className="text-slate-400" /> Career Gap Audit
                 </h4>
                 <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    {renderSafe(report?.career_gaps)}
                 </p>
               </div>
               <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-slate-200">
                  <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Clock size={14} /> Retention & Tenure Predictor
                  </h4>
                  <p className="text-sm italic leading-relaxed font-medium opacity-90">
                    "{renderSafe(report?.retention_prediction)}"
                  </p>
               </div>
            </div>
          </div>

          <DebugLog data={report} />
        </div>

        {/* RIGHT COLUMN: Chat Sidebar */}
        <div className="lg:col-span-4">
          <div className="sticky top-10 space-y-6">
            <ResumeChat candidateId={candidateId} />
            <div className="p-6 bg-black rounded-3xl text-white shadow-xl">
              <div className="flex items-center gap-2 mb-3 text-emerald-400">
                <Terminal size={16} />
                <h4 className="text-xs font-black uppercase tracking-widest">Neural Context Lock</h4>
              </div>
              <p className="text-[11px] font-medium leading-relaxed opacity-70">
                Audit data is localized to the vectorized graph of this specific candidate resume.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** * UI SUB-COMPONENTS
 */
function StatWidget({ label, value, icon }: { label: string, value: string, icon: any }) {
  return (
    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
      <div className="flex items-center gap-2 mb-2 opacity-40">
        {icon}
        <span className="text-[10px] font-black text-black uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-3xl font-black text-black">{value}</div>
    </div>
  );
}

function ListWidget({ title, items, icon, theme }: { title: string, items: any[], icon: any, theme: string }) {
  return (
    <div className={`p-8 rounded-[2rem] border ${theme}`}>
      <h3 className="text-[11px] font-black text-black uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
        {icon} {title}
      </h3>
      <ul className="space-y-4">
        {Array.isArray(items) && items.length > 0 ? items.map((item, i) => (
          <li key={i} className="text-xs font-bold flex gap-3 leading-snug text-black">
            <ChevronRight size={14} className="opacity-20 flex-shrink-0" /> {typeof item === 'object' ? JSON.stringify(item) : item}
          </li>
        )) : <li className="text-slate-400 text-xs italic font-medium">Negative detections found.</li>}
      </ul>
    </div>
  );
}

function ForensicSection({ title, content }: { title: string, content: any }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-black text-black uppercase tracking-[0.3em] flex items-center gap-4">
        <div className="w-2 h-6 bg-black" /> {title}
      </h3>
      <p className="text-sm text-slate-800 leading-relaxed font-semibold pl-6 border-l-2 border-slate-100">
        {content ? String(content).replace(/[*#]/g, '') : "Deep analysis currently unavailable for this metric."}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-black">SYNCING NEURAL DASHBOARD...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
"use client";
import { Terminal } from 'lucide-react';

export default function DebugLog({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="mt-8 bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border-b border-slate-700">
        <Terminal size={14} className="text-emerald-400" />
        <span className="text-xs font-mono text-slate-300 uppercase tracking-widest">
          AI Extraction Trace
        </span>
      </div>
      <div className="p-4 overflow-x-auto max-h-64 scrollbar-thin scrollbar-thumb-slate-700">
        <pre className="text-xs font-mono text-emerald-400 leading-relaxed">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
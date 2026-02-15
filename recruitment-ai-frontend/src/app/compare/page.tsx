"use client";

import { Activity, AlertCircle, CheckCircle2, Swords, Target, Trophy, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ComparePage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selection, setSelection] = useState({ a: "", b: "" });
  const [jd, setJd] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/history")
      .then((res) => res.json())
      .then((data) => setCandidates(Array.isArray(data) ? data : []))
      .catch((err) => console.error("History fetch error:", err));
  }, []);

  const runComparison = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8000/api/v1/compare/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_a: selection.a,
          id_b: selection.b,
          job_description: jd,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch comparison data.");
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred during comparison.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * RECTIFIED RENDERER:
   * Prevents "Objects are not valid" crash by unpacking {retention_risk, reason}.
   */
  const renderSafeText = (val: any) => {
    if (val === null || val === undefined) return "N/A";
    
    // Specifically handle the retention_risk object pattern
    if (typeof val === "object" && val.retention_risk) {
      return `${val.retention_risk} — ${val.reason || ""}`;
    }
    
    // General fallback for objects
    if (typeof val === "object") return JSON.stringify(val);
    
    return String(val);
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
          <Swords className="text-red-500" size={36} /> Candidate Debate
        </h1>
        <p className="text-slate-500 mt-2 font-medium">
          Let the AI decide who wins the role based on JD alignment.
        </p>
      </div>

      {/* SELECTION GRID (Black Text Applied Here) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {['a', 'b'].map((key) => (
          <div key={key} className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <label className="text-[10px] font-black uppercase tracking-widest text-black mb-4 block">
              Candidate {key.toUpperCase()}
            </label>
            <select
              className="w-full bg-slate-50 p-3 rounded-xl border-none outline-none font-mono text-sm cursor-pointer text-black"
              value={selection[key as keyof typeof selection]}
              onChange={(e) => setSelection({ ...selection, [key]: e.target.value })}
            >
              <option value="" className="text-black">Select Candidate ID...</option>
              {candidates.map((c: any) => (
                <option key={c.candidate_id} value={c.candidate_id} className="text-black">
                  {c.candidate_id.substring(0, 15)}...
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* JD INPUT (Black Text Applied Here) */}
      <div className="mb-8">
        <textarea
          placeholder="Paste Job Description here..."
          className="w-full h-48 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm leading-relaxed text-black placeholder:text-slate-400"
          value={jd}
          onChange={(e) => setJd(e.target.value)}
        />
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-2 text-sm font-bold border border-red-100">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <button
        onClick={runComparison}
        disabled={loading || !selection.a || !selection.b || !jd}
        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all disabled:opacity-30 flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
      >
        {loading ? "AI DEBATING..." : "GENERATE VERDICT"}
      </button>

      {result && (
        <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Winner Card (Original Amber Theme) */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-100 border-2 border-amber-200 rounded-3xl p-8 relative overflow-hidden shadow-sm">
            <Trophy className="absolute -right-4 -bottom-4 text-amber-200/40" size={180} />
            <div className="relative z-10">
              <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">The Winner</span>
              <h2 className="text-4xl font-black text-slate-900 mt-4 mb-2">
                {renderSafeText(result.winner)}
              </h2>
              <p className="text-slate-700 font-medium max-w-2xl leading-relaxed italic">
                {renderSafeText(result.analysis)}
              </p>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {['candidate_a', 'candidate_b'].map((key, idx) => {
              const data = result[key];
              const label = idx === 0 ? "Candidate A" : "Candidate B";
              return (
                <div key={key} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 border-b pb-2">
                    {label} Profile
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="flex items-center gap-2 text-emerald-600 text-sm font-bold mb-3">
                        <CheckCircle2 size={16} /> Key Strengths
                      </h4>
                      <ul className="space-y-2">
                        {data?.strengths?.map((s: string, i: number) => (
                          <li key={i} className="text-xs text-slate-600 bg-emerald-50 p-2 rounded-lg">{s}</li>
                        )) || <li className="text-slate-400 text-xs italic">No strengths listed</li>}
                      </ul>
                    </div>
                    <div>
                      <h4 className="flex items-center gap-2 text-red-500 text-sm font-bold mb-3">
                        <XCircle size={16} /> Missing Links / Risks
                      </h4>
                      <ul className="space-y-2">
                        {data?.weaknesses?.map((w: string, i: number) => (
                          <li key={i} className="text-xs text-slate-600 bg-red-50 p-2 rounded-lg">{w}</li>
                        )) || <li className="text-slate-400 text-xs italic">No weaknesses listed</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rationale and Scores */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Target size={16} className="text-blue-500" /> Strategic Rationale
              </h3>
              <ul className="space-y-4">
                {Array.isArray(result.justification) ? (
                  result.justification.map((item: any, i: number) => (
                    <li key={i} className="text-sm text-slate-700 flex gap-3 leading-relaxed">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex-shrink-0 flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      {renderSafeText(item)}
                    </li>
                  ))
                ) : (
                  <p className="text-slate-400 italic">No rationale provided.</p>
                )}
              </ul>
            </div>

            <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl">
              <h3 className="text-sm font-black text-emerald-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Activity size={16} /> JD Match Score
              </h3>
              <div className="space-y-8">
                <ScoreBar label="CANDIDATE A" score={result.fit_score_a} />
                <ScoreBar label="CANDIDATE B" score={result.fit_score_b} />
                
                {result.risk_comparison && (
                  <div className="mt-8 pt-6 border-t border-slate-800">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Retention Context</h4>
                    <p className="text-xs text-slate-400 leading-relaxed italic">
                        "{renderSafeText(result.risk_comparison)}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: any }) {
  const val = typeof score === "number" ? score : 0;
  return (
    <div>
      <div className="flex justify-between text-[10px] font-black mb-2 tracking-widest">
        <span className="opacity-60">{label}</span>
        <span className="text-emerald-400">{val}%</span>
      </div>
      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className="bg-emerald-400 h-2 rounded-full transition-all duration-1000"
          style={{ width: `${val}%` }}
        />
      </div>
    </div>
  );
}
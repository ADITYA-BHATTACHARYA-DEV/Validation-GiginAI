// "use client";

// import { Activity, AlertCircle, CheckCircle2, Swords, Target, Trophy, XCircle } from 'lucide-react';
// import { useEffect, useState } from 'react';

// export default function ComparePage() {
//   const [candidates, setCandidates] = useState<any[]>([]);
//   const [selection, setSelection] = useState({ a: "", b: "" });
//   const [jd, setJd] = useState("");
//   const [result, setResult] = useState<any>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     fetch("http://localhost:8000/api/v1/history")
//       .then((res) => res.json())
//       .then((data) => setCandidates(Array.isArray(data) ? data : []))
//       .catch((err) => console.error("History fetch error:", err));
//   }, []);

//   const runComparison = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await fetch("http://localhost:8000/api/v1/compare/", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           id_a: selection.a,
//           id_b: selection.b,
//           job_description: jd,
//         }),
//       });

//       if (!res.ok) throw new Error("Failed to fetch comparison data.");
//       const data = await res.json();
//       setResult(data);
//     } catch (err: any) {
//       setError(err.message || "An error occurred during comparison.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /**
//    * RECTIFIED RENDERER:
//    * Prevents "Objects are not valid" crash by unpacking {retention_risk, reason}.
//    */
//   const renderSafeText = (val: any) => {
//     if (val === null || val === undefined) return "N/A";
    
//     // Specifically handle the retention_risk object pattern
//     if (typeof val === "object" && val.retention_risk) {
//       return `${val.retention_risk} — ${val.reason || ""}`;
//     }
    
//     // General fallback for objects
//     if (typeof val === "object") return JSON.stringify(val);
    
//     return String(val);
//   };

//   return (
//     <div className="max-w-6xl mx-auto p-8">
//       <div className="mb-10">
//         <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
//           <Swords className="text-red-500" size={36} /> Candidate Debate
//         </h1>
//         <p className="text-slate-500 mt-2 font-medium">
//           Let the AI decide who wins the role based on JD alignment.
//         </p>
//       </div>

//       {/* SELECTION GRID (Black Text Applied Here) */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//         {['a', 'b'].map((key) => (
//           <div key={key} className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
//             <label className="text-[10px] font-black uppercase tracking-widest text-black mb-4 block">
//               Candidate {key.toUpperCase()}
//             </label>
//             <select
//               className="w-full bg-slate-50 p-3 rounded-xl border-none outline-none font-mono text-sm cursor-pointer text-black"
//               value={selection[key as keyof typeof selection]}
//               onChange={(e) => setSelection({ ...selection, [key]: e.target.value })}
//             >
//               <option value="" className="text-black">Select Candidate ID...</option>
//               {candidates.map((c: any) => (
//                 <option key={c.candidate_id} value={c.candidate_id} className="text-black">
//                   {c.candidate_id.substring(0, 15)}...
//                 </option>
//               ))}
//             </select>
//           </div>
//         ))}
//       </div>

//       {/* JD INPUT (Black Text Applied Here) */}
//       <div className="mb-8">
//         <textarea
//           placeholder="Paste Job Description here..."
//           className="w-full h-48 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm leading-relaxed text-black placeholder:text-slate-400"
//           value={jd}
//           onChange={(e) => setJd(e.target.value)}
//         />
//       </div>

//       {error && (
//         <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-2 text-sm font-bold border border-red-100">
//           <AlertCircle size={18} /> {error}
//         </div>
//       )}

//       <button
//         onClick={runComparison}
//         disabled={loading || !selection.a || !selection.b || !jd}
//         className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all disabled:opacity-30 flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
//       >
//         {loading ? "AI DEBATING..." : "GENERATE VERDICT"}
//       </button>

//       {result && (
//         <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
//           {/* Winner Card (Original Amber Theme) */}
//           <div className="bg-gradient-to-br from-amber-50 to-orange-100 border-2 border-amber-200 rounded-3xl p-8 relative overflow-hidden shadow-sm">
//             <Trophy className="absolute -right-4 -bottom-4 text-amber-200/40" size={180} />
//             <div className="relative z-10">
//               <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">The Winner</span>
//               <h2 className="text-4xl font-black text-slate-900 mt-4 mb-2">
//                 {renderSafeText(result.winner)}
//               </h2>
//               <p className="text-slate-700 font-medium max-w-2xl leading-relaxed italic">
//                 {renderSafeText(result.analysis)}
//               </p>
//             </div>
//           </div>

//           {/* Detailed Breakdown */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//             {['candidate_a', 'candidate_b'].map((key, idx) => {
//               const data = result[key];
//               const label = idx === 0 ? "Candidate A" : "Candidate B";
//               return (
//                 <div key={key} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
//                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 border-b pb-2">
//                     {label} Profile
//                   </h3>
                  
//                   <div className="space-y-6">
//                     <div>
//                       <h4 className="flex items-center gap-2 text-emerald-600 text-sm font-bold mb-3">
//                         <CheckCircle2 size={16} /> Key Strengths
//                       </h4>
//                       <ul className="space-y-2">
//                         {data?.strengths?.map((s: string, i: number) => (
//                           <li key={i} className="text-xs text-slate-600 bg-emerald-50 p-2 rounded-lg">{s}</li>
//                         )) || <li className="text-slate-400 text-xs italic">No strengths listed</li>}
//                       </ul>
//                     </div>
//                     <div>
//                       <h4 className="flex items-center gap-2 text-red-500 text-sm font-bold mb-3">
//                         <XCircle size={16} /> Missing Links / Risks
//                       </h4>
//                       <ul className="space-y-2">
//                         {data?.weaknesses?.map((w: string, i: number) => (
//                           <li key={i} className="text-xs text-slate-600 bg-red-50 p-2 rounded-lg">{w}</li>
//                         )) || <li className="text-slate-400 text-xs italic">No weaknesses listed</li>}
//                       </ul>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           {/* Rationale and Scores */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//             <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
//               <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
//                 <Target size={16} className="text-blue-500" /> Strategic Rationale
//               </h3>
//               <ul className="space-y-4">
//                 {Array.isArray(result.justification) ? (
//                   result.justification.map((item: any, i: number) => (
//                     <li key={i} className="text-sm text-slate-700 flex gap-3 leading-relaxed">
//                       <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex-shrink-0 flex items-center justify-center text-xs font-bold">
//                         {i + 1}
//                       </span>
//                       {renderSafeText(item)}
//                     </li>
//                   ))
//                 ) : (
//                   <p className="text-slate-400 italic">No rationale provided.</p>
//                 )}
//               </ul>
//             </div>

//             <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl">
//               <h3 className="text-sm font-black text-emerald-400 uppercase tracking-widest mb-6 flex items-center gap-2">
//                 <Activity size={16} /> JD Match Score
//               </h3>
//               <div className="space-y-8">
//                 <ScoreBar label="CANDIDATE A" score={result.fit_score_a} />
//                 <ScoreBar label="CANDIDATE B" score={result.fit_score_b} />
                
//                 {result.risk_comparison && (
//                   <div className="mt-8 pt-6 border-t border-slate-800">
//                     <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Retention Context</h4>
//                     <p className="text-xs text-slate-400 leading-relaxed italic">
//                         "{renderSafeText(result.risk_comparison)}"
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// function ScoreBar({ label, score }: { label: string; score: any }) {
//   const val = typeof score === "number" ? score : 0;
//   return (
//     <div>
//       <div className="flex justify-between text-[10px] font-black mb-2 tracking-widest">
//         <span className="opacity-60">{label}</span>
//         <span className="text-emerald-400">{val}%</span>
//       </div>
//       <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
//         <div
//           className="bg-emerald-400 h-2 rounded-full transition-all duration-1000"
//           style={{ width: `${val}%` }}
//         />
//       </div>
//     </div>
//   );
// }










"use client";

import { Activity, AlertCircle, CheckCircle2, Medal, Plus, Swords, Target, Trash2, Trophy, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ComparePage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  // CHANGED: selection is now an array of IDs
  const [selection, setSelection] = useState<string[]>(["", ""]); 
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

  const addCandidate = () => {
    if (selection.length < 5) setSelection([...selection, ""]);
  };

  const removeCandidate = (index: number) => {
    const newSelection = [...selection];
    newSelection.splice(index, 1);
    setSelection(newSelection);
  };

  const updateSelection = (index: number, value: string) => {
    const newSelection = [...selection];
    newSelection[index] = value;
    setSelection(newSelection);
  };

  const runComparison = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8000/api/v1/compare/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_ids: selection.filter(id => id !== ""), // Filter out empty selects
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

  const renderSafeText = (val: any) => {
    if (val === null || val === undefined) return "N/A";
    if (typeof val === "object" && val.retention_risk) {
      return `${val.retention_risk} — ${val.reason || ""}`;
    }
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
          <Swords className="text-red-500" size={36} /> Candidate Battle Royale
        </h1>
        <p className="text-slate-500 mt-2 font-medium">
          Compare up to 5 profiles at once against the Job Description.
        </p>
      </div>

      {/* DYNAMIC SELECTION GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {selection.map((selectedId, index) => (
          <div key={index} className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm relative group">
            <label className="text-[10px] font-black uppercase tracking-widest text-black mb-4 block">
              Candidate Slot {index + 1}
            </label>
            <div className="flex gap-2">
                <select
                className="flex-1 bg-slate-50 p-3 rounded-xl border-none outline-none font-mono text-sm cursor-pointer text-black"
                value={selectedId}
                onChange={(e) => updateSelection(index, e.target.value)}
                >
                <option value="" className="text-black">Select Candidate ID...</option>
                {candidates.map((c: any) => (
                    <option key={c.candidate_id} value={c.candidate_id} className="text-black">
                    {c.candidate_id.substring(0, 15)}...
                    </option>
                ))}
                </select>
                {selection.length > 2 && (
                    <button onClick={() => removeCandidate(index)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                    </button>
                )}
            </div>
          </div>
        ))}
        {selection.length < 5 && (
            <button 
                onClick={addCandidate}
                className="p-6 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all bg-slate-50/50"
            >
                <Plus size={24} />
                <span className="text-[10px] font-black uppercase">Add Candidate</span>
            </button>
        )}
      </div>

      {/* JD INPUT */}
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
        disabled={loading || selection.filter(id => id !== "").length < 2 || !jd}
        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all disabled:opacity-30 flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
      >
        {loading ? "AI DEBATING..." : "RUN MULTI-AUDIT VERDICT"}
      </button>

      {result && (
        <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Winner Hero Card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-100 border-2 border-amber-200 rounded-3xl p-8 relative overflow-hidden shadow-sm">
            <Trophy className="absolute -right-4 -bottom-4 text-amber-200/40" size={180} />
            <div className="relative z-10">
              <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Master Winner</span>
              <h2 className="text-4xl font-black text-slate-900 mt-4 mb-2">
                ID: {renderSafeText(result.winner_id)}
              </h2>
              <p className="text-slate-700 font-medium max-w-2xl leading-relaxed italic">
                {renderSafeText(result.executive_summary)}
              </p>
            </div>
          </div>

          {/* LEADERBOARD GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">
                    <Medal size={18} className="text-blue-500" /> Rankings Leaderboard
                </h3>
                <div className="grid grid-cols-1 gap-4">
                    {result.leaderboard?.map((candidate: any, idx: number) => (
                        <div key={candidate.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black shrink-0 ${
                                idx === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
                            }`}>
                                {idx + 1}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xs font-mono font-black text-slate-400 uppercase tracking-widest">{candidate.id.substring(0, 15)}...</span>
                                    <span className="text-lg font-black text-emerald-600">{candidate.fit_score}%</span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed mb-4 italic">"{candidate.verdict}"</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <h5 className="text-[10px] font-black uppercase text-emerald-600 flex items-center gap-1"><CheckCircle2 size={12}/> Strengths</h5>
                                        {candidate.strengths?.slice(0, 2).map((s: string, i: number) => (
                                            <div key={i} className="text-[10px] bg-emerald-50 text-slate-600 p-2 rounded-lg">{s}</div>
                                        ))}
                                    </div>
                                    <div className="space-y-2">
                                        <h5 className="text-[10px] font-black uppercase text-red-500 flex items-center gap-1"><XCircle size={12}/> Risks</h5>
                                        {candidate.weaknesses?.slice(0, 2).map((w: string, i: number) => (
                                            <div key={i} className="text-[10px] bg-red-50 text-slate-600 p-2 rounded-lg">{w}</div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sidebar Meta */}
            <div className="space-y-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Target size={16} className="text-blue-500" /> Winning Justification
                    </h3>
                    <ul className="space-y-4">
                        {result.justification?.map((item: any, i: number) => (
                            <li key={i} className="text-xs text-slate-700 flex gap-3 leading-relaxed">
                            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex-shrink-0 flex items-center justify-center text-[10px] font-bold">
                                {i + 1}
                            </span>
                            {renderSafeText(item)}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl">
                    <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Activity size={14} /> Global Risk Comparison
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed italic">
                        "{renderSafeText(result.risk_comparison)}"
                    </p>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import {
  Activity, AlertCircle, Anchor, CheckCircle2, MessageSquare, Plus,
  Send,
  ShieldAlert,
  ShieldCheck, Swords, Trash2, Trophy, X, XCircle, Zap
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function ComparePage() {
  // --- CORE STATE ---
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selection, setSelection] = useState<string[]>(["", ""]); 
  const [jd, setJd] = useState("");
  const [mode, setMode] = useState<"helpful" | "forensic">("forensic");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- FLOATING CHAT STATE ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{role: string, content: string}[]>([
    { role: 'assistant', content: 'Audit complete. I am ready to discuss the specific nuances of these contenders. What would you like to drill down into?' }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/history")
      .then((res) => res.json())
      .then((data) => setCandidates(Array.isArray(data) ? data : []))
      .catch((err) => console.error("History fetch error:", err));
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // --- SELECTION HELPERS ---
  const addCandidate = () => {
    if (selection.length < 5) setSelection([...selection, ""]);
  };

  const removeCandidate = (index: number) => {
    if (selection.length > 2) {
      const newSelection = [...selection];
      newSelection.splice(index, 1);
      setSelection(newSelection);
    }
  };

  const updateSelection = (index: number, value: string) => {
    const newSelection = [...selection];
    newSelection[index] = value;
    setSelection(newSelection);
  };

  const runComparison = async () => {
    setLoading(true);
    setResult(null); 
    setError(null);
    try {
      const res = await fetch("http://localhost:8000/api/v1/compare/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_ids: selection.filter(id => id !== ""),
          job_description: jd,
          mode: mode,
        }),
      });
      if (!res.ok) throw new Error("Comparison failed.");
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError("Forensic pipeline error. Please check backend connectivity.");
    } finally {
      setLoading(false);
    }
  };

  // --- CHAT LOGIC ---
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/v1/chat/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: userMsg,
          history: chatMessages.map(m => ({ role: m.role, content: m.content })),
          comparison_context: {
            jd: jd,
            comparison_results: result,
            mode: mode
          }
        }),
      });

      if (!res.ok) throw new Error("Advisor offline");
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: "Reasoning engine unavailable. Check your network or API logs." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const getWinnerName = () => {
    if (!result || !result.leaderboard || result.winner_id === "NONE") return null;
    return result.leaderboard.find((c: any) => c.id === result.winner_id)?.candidate_name || result.winner_id;
  };

  const renderSafeText = (val: any) => {
    if (val === null || val === undefined) return "N/A";
    return String(val).replace(/[*#]/g, '');
  };

  return (
    <div className="max-w-7xl mx-auto p-8 text-black relative min-h-screen">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-5xl font-black text-black flex items-center gap-4 tracking-tighter uppercase leading-none">
            <Swords className="text-red-600" size={48} /> Candidate Debate
          </h1>
          <p className="text-slate-400 mt-2 font-bold uppercase tracking-widest text-xs">Forensic JD Alignment & Battle Royale</p>
        </div>
        <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1 border border-slate-200 shadow-inner">
          <button onClick={() => setMode("helpful")} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${mode === "helpful" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"}`}>Helpful Recruiter</button>
          <button onClick={() => setMode("forensic")} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${mode === "forensic" ? "bg-black text-white shadow-lg" : "text-slate-400"}`}>Forensic Auditor</button>
        </div>
      </div>

      {/* DYNAMIC SELECTION GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {selection.map((selectedId, index) => (
          <div key={index} className="p-8 bg-white rounded-[2rem] border-2 border-slate-100 shadow-sm relative group hover:border-black transition-all">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 block">Contender {index + 1}</label>
            <div className="flex gap-3">
              <select className="flex-1 bg-slate-50 p-4 rounded-2xl outline-none font-bold text-sm text-black cursor-pointer" value={selectedId} onChange={(e) => updateSelection(index, e.target.value)}>
                <option value="">Select ID...</option>
                {candidates.map((c: any) => (<option key={c.candidate_id} value={c.candidate_id}>{c.candidate_id.substring(0, 15)}...</option>))}
              </select>
              {selection.length > 2 && (
                <button onClick={() => removeCandidate(index)} className="p-2 text-slate-300 hover:text-red-600 transition-colors">
                  <Trash2 size={20}/>
                </button>
              )}
            </div>
          </div>
        ))}
        {selection.length < 5 && (
          <button onClick={addCandidate} className="p-8 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-300 hover:border-black hover:text-black transition-all bg-slate-50/30">
            <Plus size={32}/><span className="text-[10px] font-black uppercase tracking-widest">Add Contender</span>
          </button>
        )}
      </div>

      {/* JD INPUT AREA */}
      <div className="mb-10">
        <textarea placeholder="Paste Job Description for Forensic Analysis..." className="w-full h-56 p-8 rounded-[2.5rem] bg-white border-2 border-slate-100 outline-none focus:border-black transition-all text-black font-medium leading-relaxed" value={jd} onChange={(e) => setJd(e.target.value)} />
      </div>

      {error && <div className="mb-8 p-6 bg-red-50 text-red-600 rounded-[2rem] font-black border-2 border-red-100 uppercase text-xs flex items-center gap-3 animate-pulse"><AlertCircle size={20}/>{error}</div>}

      <button onClick={runComparison} disabled={loading || selection.filter(id => id !== "").length < 2 || !jd} className="w-full py-6 bg-black text-white rounded-[2rem] font-black text-lg uppercase tracking-[0.2em] hover:bg-slate-800 disabled:opacity-20 flex items-center justify-center gap-4 shadow-2xl transition-all">
        {loading ? <Zap className="animate-pulse" /> : <Activity />}
        {loading ? "Forensic Audit Active..." : "Execute Battle Verdict"}
      </button>

      {/* RESULTS DISPLAY */}
      {result && (
        <div className="mt-20 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-40">
          
          {/* TROPHY HERO */}
          {result.winner_id === "NONE" || result.status === "NO_SUITABLE_MATCH" ? (
             <div className="bg-red-50 border-4 border-red-100 rounded-[3rem] p-12 text-center relative overflow-hidden">
                <XCircle className="absolute -right-8 -bottom-8 text-red-100" size={240} />
                <h2 className="relative z-10 text-5xl font-black text-red-900 uppercase">No Suitable Match</h2>
                <p className="relative z-10 text-red-700 font-bold text-xl mt-4 italic opacity-80">"{renderSafeText(result.executive_summary)}"</p>
             </div>
          ) : (
            <div className="bg-gradient-to-br from-amber-50 to-orange-100 border-4 border-amber-200 rounded-[3rem] p-12 relative overflow-hidden shadow-2xl">
              <Trophy className="absolute -right-8 -bottom-8 text-amber-200/40" size={240} />
              <div className="relative z-10">
                <span className="bg-amber-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">Battle Winner</span>
                <h2 className="text-6xl font-black text-slate-900 mt-6 mb-4 tracking-tighter uppercase leading-none">{renderSafeText(getWinnerName())}</h2>
                <div className="mb-6 flex items-center gap-3">
                  <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-200/50 px-2 py-0.5 rounded">REF: {result.winner_id.substring(0, 18)}...</span>
                  <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-black uppercase tracking-widest"><ShieldCheck size={14}/> Forensic Match Verified</div>
                </div>
                <p className="text-slate-800 font-bold text-xl max-w-3xl leading-relaxed italic opacity-90">{renderSafeText(result.executive_summary)}</p>
              </div>
            </div>
          )}

          {/* LEADERBOARD & RATIONALE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-6">
                <h3 className="text-xs font-black text-black uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                   <div className="w-1.5 h-4 bg-black" /> Rankings & Stability Audit
                </h3>
                {result.leaderboard?.map((candidate: any, idx: number) => (
                    <div key={candidate.id} className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm flex flex-col gap-6 transition-all hover:scale-[1.01]">
                        <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-2xl font-black uppercase tracking-tight">{candidate.candidate_name || "Unknown"}</h4>
                              <span className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${candidate.tenure_risk === 'High' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                <ShieldAlert size={10} /> {candidate.tenure_risk || 'Low'} Risk Tenure
                              </span>
                            </div>
                            <div className="flex gap-8">
                                <div className="text-right">
                                    <span className={`text-4xl font-black ${candidate.fit_score >= 50 ? 'text-emerald-500' : 'text-red-500'}`}>{candidate.fit_score}%</span>
                                    <div className="text-[9px] font-black text-slate-300 uppercase mt-1">Match Index</div>
                                </div>
                                <div className="text-right">
                                    <span className="text-4xl font-black text-blue-500">{candidate.retention_score || 0}%</span>
                                    <div className="text-[9px] font-black text-slate-300 uppercase mt-1">Stability</div>
                                </div>
                            </div>
                        </div>
                        {/* RETENTION RATIONALE BLOCK */}
                        <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 flex gap-4 items-start">
                            <Anchor className="text-blue-600 shrink-0 mt-1" size={16} />
                            <div>
                                <h5 className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-1">Retention Analysis</h5>
                                <p className="text-xs text-slate-600 font-bold leading-relaxed italic">"{renderSafeText(candidate.retention_rationale)}"</p>
                            </div>
                        </div>

                        <p className="text-sm text-slate-600 font-medium italic border-l-4 border-slate-100 pl-4">"{renderSafeText(candidate.verdict)}"</p>

                        {/* RESTORED STRENGTHS & GAPS GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                            <div className="space-y-3">
                                <h5 className="text-[10px] font-black uppercase text-emerald-500 flex items-center gap-2 tracking-widest">
                                    <CheckCircle2 size={14}/> Verified Strengths
                                </h5>
                                {candidate.verified_strengths?.map((s: string, i: number) => (
                                    <div key={i} className="text-[11px] font-bold text-slate-700 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                                        {s}
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-3">
                                <h5 className="text-[10px] font-black uppercase text-red-500 flex items-center gap-2 tracking-widest">
                                    <XCircle size={14}/> Forensic Gaps
                                </h5>
                                {candidate.missing_skills?.map((w: string, i: number) => (
                                    <div key={i} className="text-[11px] font-bold text-slate-700 bg-red-50 p-3 rounded-xl border border-red-100">
                                        {w}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* SIDEBAR */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 sticky top-8 shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Winning Justification</h3>
                    <ul className="space-y-6">
                        {result.justification?.map((item: any, i: number) => (
                            <li key={i} className="text-xs text-slate-800 flex gap-4 font-bold leading-relaxed">
                                <span className="w-6 h-6 rounded-lg bg-slate-900 text-white flex-shrink-0 flex items-center justify-center text-[10px]">{i + 1}</span>
                                {renderSafeText(item)}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* --- FLOATING CHAT WIDGET --- */}
      <div className={`fixed bottom-8 right-8 z-50 transition-all duration-500 transform ${isChatOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95 pointer-events-none'}`}>
        <div className="bg-white w-[400px] h-[600px] rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-slate-100 flex flex-col overflow-hidden ring-4 ring-slate-50">
          <div className="bg-black p-6 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">Talent Advisor AI</span>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/10 p-2 rounded-xl transition-colors"><X size={18}/></button>
          </div>
          <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed font-medium shadow-sm ${msg.role === 'user' ? 'bg-black text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {chatLoading && <div className="flex justify-start"><div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex gap-1"><div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" /><div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" /><div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" /></div></div>}
          </div>
          <form onSubmit={handleChatSubmit} className="p-6 bg-white border-t border-slate-100 flex gap-3">
            <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask about these candidates..." className="flex-1 bg-slate-50 px-5 py-3 rounded-2xl outline-none text-sm font-bold text-black placeholder:text-slate-300 focus:ring-2 focus:ring-black/5" />
            <button type="submit" className="bg-black text-white p-3 rounded-2xl hover:bg-slate-800 transition-colors shadow-lg"><Send size={18} /></button>
          </form>
        </div>
      </div>

      {!isChatOpen && (
        <button onClick={() => setIsChatOpen(true)} className="fixed bottom-8 right-8 bg-black text-white p-6 rounded-[2rem] shadow-2xl hover:scale-110 transition-all flex items-center gap-3 z-40 group ring-8 ring-white">
          <MessageSquare className="group-hover:rotate-12 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Discuss Audit</span>
        </button>
      )}
    </div>
  );
}
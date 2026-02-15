"use client";

import {
  ArrowUpRight,
  BarChart3,
  Clock,
  Database,
  Download // New Icon
  ,
  Filter,
  Search,
  UserSearch
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

export default function CandidateDatabase() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRisk, setFilterRisk] = useState("All");

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/history")
      .then(res => res.json())
      .then(data => {
        setCandidates(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Database lookup failed:", err);
        setLoading(false);
      });
  }, []);

  // --- CSV Export Logic ---
  const handleExportCSV = () => {
    if (candidates.length === 0) return;

    // Define headers
    const headers = ["Candidate ID", "Depth Score (%)", "Retention Risk", "Audit Date"];
    
    // Map data to rows
    const rows = filteredCandidates.map(c => [
      c.candidate_id,
      c.depth_score,
      c.retention_risk,
      new Date(c.created_at).toLocaleDateString()
    ]);

    // Construct CSV String
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `RecruitAI_Export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const matchesSearch = c.candidate_id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRisk = filterRisk === "All" || c.retention_risk === filterRisk;
      return matchesSearch && matchesRisk;
    });
  }, [searchTerm, filterRisk, candidates]);

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Candidate Repository</h1>
          <p className="text-slate-500 mt-1">Verified audit history stored in recruitment.db</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Export Button */}
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all"
          >
            <Download size={16} /> Export CSV
          </button>
          <div className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-200">
            <Database size={16} /> {candidates.length} Records
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by Candidate ID..." 
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select 
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white cursor-pointer shadow-sm"
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
          >
            <option value="All">All Risk Levels</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
          </select>
        </div>
      </div>

      {/* Database Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">UID Reference</th>
                <th className="p-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Depth Score</th>
                <th className="p-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Retention Risk</th>
                <th className="p-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="p-20 text-center animate-pulse text-slate-400 font-medium">Syncing with SQLite...</td></tr>
              ) : filteredCandidates.map((c) => (
                <tr key={c.candidate_id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white transition-colors">
                        <UserSearch size={14} />
                      </div>
                      <span className="font-mono text-xs text-slate-600 font-medium">{c.candidate_id}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-bold text-xs">
                      <BarChart3 size={12} /> {c.depth_score}%
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-black uppercase ${
                      c.retention_risk === 'High' ? 'bg-red-100 text-red-600' : 
                      c.retention_risk === 'Medium' ? 'bg-amber-100 text-amber-600' : 
                      'bg-emerald-100 text-emerald-600'
                    }`}>
                      <Clock size={10} /> {c.retention_risk}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link 
                      href={`/dashboard?id=${c.candidate_id}`}
                      className="p-2 rounded-lg bg-slate-100 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all inline-flex items-center"
                    >
                      <ArrowUpRight size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
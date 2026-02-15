"use client";
import { ChevronRight, History, User } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function HistorySidebar() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/history')
      .then(res => res.json())
      .then(data => setHistory(data));
  }, []);

  return (
    <div className="w-64 bg-white border-r h-screen p-4 overflow-y-auto hidden md:block">
      <div className="flex items-center gap-2 mb-6 text-slate-800 font-bold">
        <History size={20} />
        <span>Recent Audits</span>
      </div>
      
      <div className="space-y-2">
        {history.map((item: any) => (
          <Link 
            key={item.candidate_id} 
            href={`/dashboard?id=${item.candidate_id}`}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <User size={16} className="text-slate-400" />
              <span className="text-xs font-medium truncate text-slate-600">
                {item.candidate_id.split('-')[0]}...
              </span>
            </div>
            <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500" />
          </Link>
        ))}
      </div>
    </div>
  );
}
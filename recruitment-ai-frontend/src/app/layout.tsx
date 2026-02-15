"use client";

import { History, LayoutDashboard, RefreshCw, Swords, UploadCloud, User, UserSearch } from "lucide-react";
import { Inter } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

/**
 * HISTORY LIST COMPONENT
 */
function HistoryList() {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/history");
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 30000);
    return () => clearInterval(interval);
  }, [fetchHistory]);

  return (
    <div className="mt-8 px-4">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <History size={12} />
          <span>Recent Audits</span>
        </div>
        <button 
          onClick={() => { setIsLoading(true); fetchHistory(); }}
          className="text-gray-400 hover:text-blue-500 transition-colors"
        >
          <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="space-y-1 max-h-[35vh] overflow-y-auto pr-1 custom-scrollbar">
        {isLoading ? (
          <div className="space-y-2 px-2">
            <div className="h-3 bg-gray-100 rounded animate-pulse w-full"></div>
            <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3"></div>
          </div>
        ) : history.length > 0 ? (
          history.map((item: any) => (
            <Link
              key={item.candidate_id}
              href={`/dashboard?id=${item.candidate_id}`}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-50 text-sm text-gray-600 hover:text-blue-600 transition-all group border border-transparent hover:border-blue-100"
            >
              <User size={14} className="text-gray-400 group-hover:text-blue-500" />
              <span className="truncate font-mono text-[11px]">
                {item.candidate_id.substring(0, 8)}...
              </span>
            </Link>
          ))
        ) : (
          <div className="text-center py-6 px-2 border border-dashed rounded-xl border-gray-200">
            <p className="text-[10px] text-gray-400 italic">No audits found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Upload Resume", href: "/upload", icon: <UploadCloud size={20} /> },
    { name: "Candidate Search", href: "/", icon: <UserSearch size={20} /> },
    // NEW: Compare Mode Navigation Item
    { name: "Compare Mode", href: "/compare", icon: <Swords size={20} /> },
  ];

  return (
    <html lang="en">
      <body className={`${inter.className} flex h-screen bg-gray-50 text-gray-900 overflow-hidden`}>
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-20">
          <div className="p-6">
            <Link href="/" className="text-2xl font-black text-blue-600 tracking-tighter">
              RECRUIT<span className="text-slate-900">AI</span>
            </Link>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 p-3 rounded-xl transition-all font-semibold ${
                    isActive 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                      : "hover:bg-blue-50 hover:text-blue-600 text-slate-600"
                  }`}
                >
                  <span className={isActive ? "text-white" : ""}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Sidebar History Section */}
            <HistoryList />
          </nav>

          <div className="p-6 border-t border-gray-50">
            <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>LPU Core Active</span>
            </div>
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 overflow-y-auto relative bg-slate-50/50">
          <div className="max-w-7xl mx-auto h-full p-0">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
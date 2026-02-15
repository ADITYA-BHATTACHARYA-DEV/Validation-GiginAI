"use client";
import { AlertCircle, Bot, Quote, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  citation?: string | null;
}

export default function ResumeChat({ candidateId }: { candidateId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || !candidateId) {
      if (!candidateId) setError("Missing Candidate ID. Please refresh.");
      return;
    };
    
    setError(null);
    const userMsg: ChatMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setInput("");

    try {
      // Clean history to ensure it's a simple list of role/content dicts
      const cleanHistory = messages.slice(-6).map(({ role, content }) => ({
        role,
        content
      }));

      const res = await fetch("http://localhost:8000/api/v1/chat/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_id: String(candidateId), // Force cast to string
          query: input,
          history: cleanHistory
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to get response");
      }

      const data = await res.json();
      
      const assistantMsg: ChatMessage = { 
        role: "assistant", 
        content: data.answer || "No response provided.",
        citation: data.citation || null
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error("Chat error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border shadow-lg flex flex-col h-[600px] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot size={20} className="text-blue-600" />
          <h3 className="font-bold text-slate-800 text-sm tracking-tight uppercase">Agentic Contextual Chat</h3>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-widest">
            Grounded AI
            </span>
        </div>
      </div>

      {/* Chat Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
            <Bot size={48} className="mb-4 text-slate-300" />
            <p className="text-sm font-medium text-slate-500 italic">
              "Tell me about this candidate's leadership skills..."
            </p>
          </div>
        )}
        
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none shadow-md' 
                : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
            }`}>
              {m.content}
              
              {m.role === 'assistant' && m.citation && (
                <div className="mt-4 pt-3 border-t border-slate-300/30">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                    <Quote size={10} /> Source Reference
                  </div>
                  <div className="bg-white/50 p-3 rounded-xl border border-slate-200 italic text-[11px] text-slate-600 leading-normal">
                    "{m.citation}"
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
             <div className="flex gap-1 mr-2">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
             </div>
             Consulting RAG Engine...
          </div>
        )}
        {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-xs border border-red-100">
                <AlertCircle size={14} />
                {error}
            </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-inner transition-all">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about candidate's tenure or projects..."
            className="flex-1 bg-transparent border-none px-4 py-2 text-sm outline-none placeholder:text-slate-400"
          />
          <button 
            onClick={sendMessage} 
            disabled={loading || !input.trim()}
            className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:bg-slate-300 disabled:shadow-none"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
"use client";
import ResultCard from '@/components/analysis/ResultCard';
import AnalysisCharts from '@/components/charts/AnalysisCharts';
import { useAuditStore } from '@/store/useAuditStore';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const { currentCandidateId } = useAuditStore();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (currentCandidateId) {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/analyze/${currentCandidateId}`)
        .then(res => res.json())
        .then(val => setData(val));
    }
  }, [currentCandidateId]);

  if (!currentCandidateId) return <div className="p-10">Please upload a resume first.</div>;
  if (!data) return <div className="p-10">Analyzing Candidate Data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Audit Results</h1>
        <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-medium">
          ID: {currentCandidateId.slice(0, 8)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ResultCard content={data.audit_report} />
        </div>
        <div className="space-y-6">
          <AnalysisCharts depth={data.depth_score} retention={data.retention_risk} />
          <div className="bg-blue-600 p-6 rounded-2xl text-white">
            <p className="text-blue-100 text-sm">Overall Depth Score</p>
            <h2 className="text-4xl font-bold">{data.depth_score}</h2>
          </div>
        </div>
      </div>
    </div>
  );
}
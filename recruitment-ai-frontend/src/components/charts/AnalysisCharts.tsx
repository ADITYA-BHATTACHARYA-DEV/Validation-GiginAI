"use client";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts';

export default function AnalysisCharts({ depth, retention }: { depth: number, retention: string }) {
  const data = [
    { subject: 'Work Depth', A: depth * 10, fullMark: 100 },
    { subject: 'Retention', A: retention === "Low" ? 90 : 50, fullMark: 100 },
    { subject: 'Authenticity', A: 85, fullMark: 100 },
    { subject: 'Skill Match', A: 70, fullMark: 100 },
  ];

  return (
    <div className="h-[300px] w-full bg-white p-4 rounded-xl shadow-sm border">
      <h4 className="text-sm font-semibold mb-2 text-gray-500">Metric Breakdown</h4>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <Radar name="Candidate" dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
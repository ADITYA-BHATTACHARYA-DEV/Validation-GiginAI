import { api } from '@/lib/api';
import { useAuditStore } from '@/store/useAuditStore';
import { useState } from 'react';

export const useAnalysis = () => {
  const { setCandidate, setResult, setAnalyzing } = useAuditStore();
  const [error, setError] = useState<string | null>(null);

  const startAnalysis = async (candidateId: string) => {
    setAnalyzing(true);
    setError(null);
    try {
      const data = await api.getAnalysis(candidateId);
      setResult(data.audit_report);
      setCandidate(candidateId);
    } catch (err) {
      setError("Failed to analyze resume. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  return { startAnalysis, error };
};
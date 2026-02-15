import { create } from 'zustand';

interface AuditState {
  currentCandidateId: string | null;
  analysisResult: string | null;
  isAnalyzing: boolean;
  setCandidate: (id: string) => void;
  setResult: (result: string) => void;
  setAnalyzing: (status: boolean) => void;
}

export const useAuditStore = create<AuditState>((set) => ({
  currentCandidateId: null,
  analysisResult: null,
  isAnalyzing: false,
  setCandidate: (id) => set({ currentCandidateId: id }),
  setResult: (result) => set({ analysisResult: result }),
  setAnalyzing: (status) => set({ isAnalyzing: status }),
}));
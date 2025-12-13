import { create } from 'zustand';

interface CredibilityStore {
  point: number;
  credibility: number;
  setPoint: (point: number) => void;
  setCredibility: (credibility: number) => void;
}

export const useCredibilityStore = create<CredibilityStore>((set) => ({
  point: 0,
  credibility: 80,
  setPoint: (point) => set({ point }),
  setCredibility: (credibility) => set({ credibility }),
}));

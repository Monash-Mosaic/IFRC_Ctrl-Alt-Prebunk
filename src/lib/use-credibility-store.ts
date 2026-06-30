import { create } from 'zustand';

interface CredibilityStore {
  point: number;
  credibility: number;
  setPoint: (point: number) => void;
  setCredibility: (credibility: number) => void;
  resetCredibility: () => void;
}

const initialCredibilityState = {
  point: 0,
  credibility: 80
}

export const useCredibilityStore = create<CredibilityStore>((set) => ({
  ...initialCredibilityState,
  setPoint: (point) => set({ point }),
  setCredibility: (credibility) => set({ credibility }),
  resetCredibility: () => set(initialCredibilityState)
}));

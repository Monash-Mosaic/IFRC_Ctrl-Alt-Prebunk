import { create } from 'zustand';

interface CredibilityStore {
  point: number;
  credibility: number;
  totalQuestions: number;
  badges: string[];
  correctAnswers: number
  setPoint: (point: number) => void;
  setCredibility: (credibility: number) => void;
  initCredibility: (totalQuestions: number) => void;
  updateBadges: () => void;
  setCorrectAnswers: (correctAnswers: number) => void;
}

export const useCredibilityStore = create<CredibilityStore>((set, get) => ({
  point: 0,
  credibility: 0,
  totalQuestions: 0,
  badges: [],
  correctAnswers: 0,

  setPoint: (point) => set({ point }),
  setCredibility: (credibility) => set({ credibility }),
  initCredibility: (totalQuestions) =>
    set({
      totalQuestions,
      credibility: totalQuestions / 2,
    }),
  updateBadges: () => {
    const state = get();

    const progress =
      state.correctAnswers / state.totalQuestions;

    let badges: string[] = [];

    if (progress >= 0.33) {
      badges.push('Misinformation Fighter');
    }
    if (progress >= 0.66) {
      badges.push('Prebunking Hero');
    }
    if (progress >= 1) {
      badges.push('Prebunking Champion');
    }

    set({ badges });
  },
  setCorrectAnswers: (correctAnswers) => set({ correctAnswers })
}));

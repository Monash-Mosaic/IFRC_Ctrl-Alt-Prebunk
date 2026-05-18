import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CredibilityStore {
  points: number;
  credibility: number;
  initialCredibility: number;
  earnedBadges: string[];
  clickedLinks: string[];
  addPoints: (amount: number) => void;
  decreaseCredibility: () => void;
  initCredibility: (totalQuestions: number) => void;
  updateBadges: (totalQuestions: number) => void;
}

export const useCredibilityStore = create<CredibilityStore>()(
  persist(
    (set, get) => ({
      points: 0,
      credibility: 0,
      initialCredibility: 0,
      earnedBadges: [],
      clickedLinks: [],

      addPoints: (amount) => {
        set((state) => ({ points: state.points + amount }));
      },
      decreaseCredibility: () => {
        set((state) => ({ credibility: Math.max(0, state.credibility - 1) }));
      },
      initCredibility: (totalQuestions) => {
        if (get().initialCredibility === 0) {
          const initial = Math.floor(totalQuestions / 2);
          set({
            initialCredibility: initial,
            credibility: initial,
          });
        }
      },
      updateBadges: (totalQuestions) => {
        const { points, earnedBadges } = get();
        const correctAnswers = points / 5;
        const progress = correctAnswers / totalQuestions;
        const badges = [...earnedBadges];

        if (progress >= 0.33 && !badges.includes('Misinformation Fighter')) {
          badges.push('Misinformation Fighter');
        }
        if (progress >= 0.66 && !badges.includes('Prebunking Hero')) {
          badges.push('Prebunking Hero');
        }
        if (progress >= 1 && !badges.includes('Prebunking Champion')) {
          badges.push('Prebunking Champion');
        }

        set({ earnedBadges: badges });
      },
    }),
    {
      name: 'credibility_state',
    }
  ));

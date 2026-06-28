import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CredibilityStore {
  points: number;
  credibility: number;
  initialCredibility: number;
  earnedBadges: number[];
  clickedLinks: string[];
  addPoints: (amount: number) => void;
  increaseCredibility: () => void;
  decreaseCredibility: () => void;
  initCredibility: (totalQuestions: number) => void;
  updateBadges: (totalQuestions: number) => void;
  recordLinkClick: (href: string) => boolean;
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
      increaseCredibility: () => {
        set((state) => ({ credibility: Math.min(state.initialCredibility, state.credibility + 1) }));
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
        const newBadges = [...earnedBadges];
        let updated = false;

        if (progress >= 0.33 && !newBadges.includes(0)) { newBadges.push(0); updated = true; }
        if (progress >= 0.66 && !newBadges.includes(1)) { newBadges.push(1); updated = true; }
        if (progress >= 1.0 && !newBadges.includes(2)) { newBadges.push(2); updated = true; }

        if (updated) {
          set({ earnedBadges: newBadges.sort() });
        }
      },

      recordLinkClick: (href) => {
        const { clickedLinks } = get();
        if (clickedLinks.includes(href)) return false;
        set({ clickedLinks: [...clickedLinks, href] });
        set((state) => ({ points: state.points + 2 }));
        return true;
      },

    }),
    {
      name: 'credibility_state',
    }
  ));

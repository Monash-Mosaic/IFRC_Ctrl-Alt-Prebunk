import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CredibilityStore {
  points: number;
  credibility: number;
  initialCredibility: number;
  clickedLinks: string[];
  addPoints: (amount: number) => void;
  increaseCredibility: () => void;
  decreaseCredibility: () => void;
  initCredibility: (totalQuestions: number) => void;
  recordLinkClick: (href: string) => boolean;
  resetCredibility: (totalQuestions: number) => void;
}

export const useCredibilityStore = create<CredibilityStore>()(
  persist(
    (set, get) => ({
      points: 0,
      credibility: 0,
      initialCredibility: 0,
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

      recordLinkClick: (href) => {
        const { clickedLinks } = get();
        if (clickedLinks.includes(href)) return false;
        set({ clickedLinks: [...clickedLinks, href] });
        set((state) => ({ points: state.points + 2 }));
        return true;
      },

      resetCredibility: (totalQuestions) => {
        const initial = Math.floor(totalQuestions / 2);
        set({
          points: 0,
          credibility: initial,
          initialCredibility: initial,
          clickedLinks: [],
        });
      },

    }),
    {
      name: 'credibility_state',
    }
  ));

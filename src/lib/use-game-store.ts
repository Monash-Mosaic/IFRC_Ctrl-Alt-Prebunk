import { create } from 'zustand';
// import { persist, createJSONStorage } from 'zustand/middleware';
// import { STORAGE_KEYS } from './local-storage';

interface GameState {
  answers: Record<string, 'like' | 'dislike'>;
  currentQuestionIndex: number;
}

interface GameStore extends GameState {
  setAnswer: (postId: string, answer: 'like' | 'dislike') => void;
  getAnswer: (postId: string) => 'like' | 'dislike' | null;
  isAnswered: (postId: string) => boolean;
  isCurrentQuestionAnswered: (contentList: Array<{ id: string }>) => boolean;
  moveToNextQuestion: (contentList: Array<{ id: string }>) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>()((set, get) => ({
  answers: {},
  currentQuestionIndex: 0,
  setAnswer: (postId: string, answer: 'like' | 'dislike') => {
    const state = get();
    // Only set answer if not already answered (immutability)
    if (!state.answers[postId]) {
      set({
        answers: {
          ...state.answers,
          [postId]: answer,
        },
      });
    }
  },
  getAnswer: (postId: string) => {
    const state = get();
    return state.answers[postId] || null;
  },
  isAnswered: (postId: string) => {
    const state = get();
    return postId in state.answers;
  },
  isCurrentQuestionAnswered: (contentList: Array<{ id: string }>) => {
    const state = get();
    const currentQuestion = contentList[state.currentQuestionIndex];
    if (!currentQuestion) return false;
    return state.isAnswered(currentQuestion.id);
  },
  moveToNextQuestion: (contentList: Array<{ id: string }>) => {
    const state = get();
    const currentQuestion = contentList[state.currentQuestionIndex];
    if (!currentQuestion) return;
    
    // Only move forward if current question is answered
    if (state.isAnswered(currentQuestion.id)) {
      const nextIndex = state.currentQuestionIndex + 1;
      // Don't go beyond the last question
      if (nextIndex < contentList.length) {
        set({
          currentQuestionIndex: nextIndex,
        });
      }
    }
  },
  resetGame: () => {
    set({
      answers: {},
      currentQuestionIndex: 0,
    });
    // Persist temporarily removed - no storage clearing needed
  },
}));

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { STORAGE_KEYS } from './local-storage';
import { ContentBase, ContentId } from '@/contents/en';

interface GameState {
  answers: Record<string, 'like' | 'dislike'>;
  currentQuestionIndex: number;
  questions: Array<ContentId>;
  questionStore: Record<ContentId, ContentBase>;
  gameCompleted: boolean;
  correctAnswers: number;
}

interface GameStore extends GameState {
  setAnswer: (postId: string, answer: 'like' | 'dislike') => void;
  getAnswer: (postId: string) => 'like' | 'dislike' | null;
  isAnswered: (postId: string) => boolean;
  isCurrentQuestionAnswered: (contentList: Array<{ id: string }>) => boolean;
  isPostDisabled: (postId: string) => boolean;
  moveToNextQuestion: () => void;
  isGameCompleted: () => boolean;
  getCorrectAnswers: () => number;
  incrCorrectAnswers: () => void;
  getNumQuestions: () => number;
  resetGame: () => void;
}

const initialGameState = {
  answers: {},
  currentQuestionIndex: 0,
  gameCompleted: false,
  correctAnswers: 0
}

export const createGameStore = (initialState?: Partial<GameState>) => create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialGameState,
      questions: [],
      questionStore: {},
      ...initialState,
      isPostDisabled: (postId: string) => {
        const state = get();
        if (!!state.answers[postId]) return false;
        const currentQuestion = state.questions[state.currentQuestionIndex];
        return currentQuestion !== postId;
      },
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
      isCurrentQuestionAnswered: () => {
        const state = get();
        const currentQuestion = state.questions[state.currentQuestionIndex];
        if (!currentQuestion) return false;
        return state.isAnswered(currentQuestion);
      },
      moveToNextQuestion: () => {
        const state = get();
        const currentQuestion = state.questions[state.currentQuestionIndex];
        if (!currentQuestion) return;
        
        // Only move forward if current question is answered
        if (state.isAnswered(currentQuestion)) {
          const nextIndex = state.currentQuestionIndex + 1;
          // Don't go beyond the last question
          if (nextIndex < state.questions.length) {
            set({
              currentQuestionIndex: nextIndex,
            });
          } else {
            set({
              gameCompleted: true,
            });
          }
        }
      },
      isGameCompleted: () => {
        const state = get();
        return state.gameCompleted;
      },
      getCorrectAnswers: () => {
        const state = get();
        return state.correctAnswers;
      },
      incrCorrectAnswers: () => {
        const state = get();
        set({
          correctAnswers: state.correctAnswers + 1,
        });
      },
      getNumQuestions: () => {
        const state = get();
        return state.questions.length;
      },
      resetGame: () => {
        set(initialGameState);
      },
    }),
    {
      name: STORAGE_KEYS.GAME_STATE,
      storage: createJSONStorage(() => localStorage),
    }
  )
);

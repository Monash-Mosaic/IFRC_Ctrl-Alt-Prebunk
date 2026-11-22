import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type AlexReply, STORAGE_KEYS, storage } from './local-storage';
import type { ContentBase, ContentId } from '@/contents/en';

interface GameState {
  answers: Record<string, string>;
  currentQuestionIndex: number;
  questions: Array<ContentId>;
  questionStore: Record<ContentId, ContentBase>;
  gameCompleted: boolean;
  correctAnswers: number;
}

interface GameStore extends GameState {
  setAnswer: (postId: string, answer: string) => boolean;
  getAnswer: (postId: string) => string | null;
  isAnswered: (postId: string) => boolean;
  isCurrentQuestionAnswered: () => boolean;
  isPostDisabled: (postId: string) => boolean;
  moveToNextQuestion: () => void;
  finishGame: () => boolean;
  isGameCompleted: () => boolean;
  getCorrectAnswers: () => number;
  incrCorrectAnswers: () => void;
  getNumQuestions: () => number;
  resetGame: () => void;
}

const GAME_STATE_CHANGED = 'prebunk:game-state-changed';

function readSavedProgress() {
  return storage.getItem<{ state?: Partial<GameState> }>(STORAGE_KEYS.GAME_STATE)?.state;
}

function getCompletedFeedTotal(state?: Partial<Pick<GameState, 'answers' | 'gameCompleted'>>) {
  if (!state?.gameCompleted || !state.answers) return null;
  // Finished sessions retain their original score when new feed questions are added.
  return Object.keys(state.answers).length || null;
}

export function isPersistedGameCompleted() {
  return readSavedProgress()?.gameCompleted === true;
}

function subscribeToSavedProgress(listener: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEYS.GAME_STATE || event.key === null) listener();
  }

  window.addEventListener(GAME_STATE_CHANGED, listener);
  window.addEventListener('storage', handleStorage);
  return () => {
    window.removeEventListener(GAME_STATE_CHANGED, listener);
    window.removeEventListener('storage', handleStorage);
  };
}

export function useGameCompleted() {
  return useSyncExternalStore(subscribeToSavedProgress, isPersistedGameCompleted, () => false);
}

export function useFeedCompleted(posts: readonly Pick<ContentBase, 'id'>[]) {
  return useSyncExternalStore(
    subscribeToSavedProgress,
    () => {
      const progress = readSavedProgress();
      if (progress?.gameCompleted) return true;
      const answers = progress?.answers;
      return !!answers && posts.length > 0 && posts.every(({ id }) => id in answers);
    },
    () => false
  );
}

export function useFeedCorrectAnswers() {
  return useSyncExternalStore(
    subscribeToSavedProgress,
    () => readSavedProgress()?.correctAnswers ?? 0,
    () => 0
  );
}

export function useCompletedFeedTotal() {
  return useSyncExternalStore(
    subscribeToSavedProgress,
    () => getCompletedFeedTotal(readSavedProgress()),
    () => null
  );
}

export function getQuizScore(feedCorrect: number, feedTotal: number, alexReply: AlexReply | null) {
  return {
    correctAnswers: feedCorrect + (alexReply === 'right' ? 1 : 0),
    totalQuestions: feedTotal + (alexReply === null ? 0 : 1),
  };
}

const initialGameState = {
  answers: {},
  currentQuestionIndex: 0,
  gameCompleted: false,
  correctAnswers: 0,
};

export const createGameStore = (initialState?: Partial<GameState>) =>
  create<GameStore>()(
    persist(
      (set, get) => ({
        ...initialGameState,
        questions: [],
        questionStore: {},
        ...initialState,
        isPostDisabled: (postId: string) => {
          const state = get();
          if (state.answers[postId]) return false;
          const postIndex = state.questions.indexOf(postId);
          if (postIndex === -1) return true;
          return state.questions.slice(0, postIndex).some((id) => !state.answers[id]);
        },
        setAnswer: (postId: string, answer: string) => {
          const { answers, gameCompleted } = get();
          if (gameCompleted || postId in answers) return false;

          set({ answers: { ...answers, [postId]: answer } });
          return true;
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
              state.finishGame();
            }
          }
        },
        finishGame: () => {
          const { gameCompleted, questions, isAnswered } = get();
          if (gameCompleted || questions.length === 0 || !questions.every(isAnswered)) return false;
          set({ gameCompleted: true });
          return true;
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
          return getCompletedFeedTotal(state) ?? state.questions.length;
        },
        resetGame: () => {
          set(initialGameState);
        },
      }),
      {
        name: STORAGE_KEYS.GAME_STATE,
        storage: createJSONStorage(() => {
          const local = window.localStorage;
          return {
            getItem: (key) => local.getItem(key),
            setItem: (key, value) => {
              local.setItem(key, value);
              window.dispatchEvent(new Event(GAME_STATE_CHANGED));
            },
            removeItem: (key) => {
              local.removeItem(key);
              window.dispatchEvent(new Event(GAME_STATE_CHANGED));
            },
          };
        }),
        partialize: (state) => ({
          answers: state.answers,
          currentQuestionIndex: state.currentQuestionIndex,
          gameCompleted: state.gameCompleted,
          correctAnswers: state.correctAnswers,
        }),
      }
    )
  );

import { useSyncExternalStore } from 'react';
import { STORAGE_KEYS, storage, subscribeToStorageKeys } from '@/lib/local-storage';
import type { Message } from '../_machines/onboarding-machine';

export interface OnboardingHistory {
  messages: Exclude<Message, { type: 'typing' }>[];
  practiceAnswer: string | null;
  finalReply?: string;
}

export function getOnboardingHistory(): OnboardingHistory | null {
  try {
    const history = storage.getItem<OnboardingHistory>(STORAGE_KEYS.PAULA_CHAT_HISTORY);
    return Array.isArray(history?.messages) && history.messages.length > 0 ? history : null;
  } catch {
    return null;
  }
}

function subscribe(listener: () => void) {
  return subscribeToStorageKeys([STORAGE_KEYS.PAULA_CHAT_HISTORY], listener);
}

export function useHasOnboardingHistory() {
  return useSyncExternalStore(
    subscribe,
    () => getOnboardingHistory() !== null,
    () => false
  );
}

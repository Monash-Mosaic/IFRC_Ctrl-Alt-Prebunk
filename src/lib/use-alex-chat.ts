'use client';

import { useSyncExternalStore } from 'react';
import {
  defaultAlexChatState,
  storage,
  STORAGE_KEYS,
  type AlexChatState,
} from './local-storage';

let memory: AlexChatState | null = null;
const listeners = new Set<() => void>();

function readAlexChat(): AlexChatState {
  if (memory) return memory;
  const saved = storage.getItem<AlexChatState>(STORAGE_KEYS.ALEX_CHAT, defaultAlexChatState);
  memory = saved;
  return saved;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): AlexChatState {
  return readAlexChat();
}

function getServerSnapshot(): AlexChatState {
  return defaultAlexChatState;
}

export function useAlexChat() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const update = (next: AlexChatState) => {
    memory = next;
    storage.setItem(STORAGE_KEYS.ALEX_CHAT, next);
    listeners.forEach((listener) => listener());
  };

  return [state, update, true] as const;
}

'use client';

import { useEffect, useState } from 'react';
import {
  defaultAlexChatState,
  storage,
  STORAGE_KEYS,
  type AlexChatState,
} from './local-storage';

let memory: AlexChatState | null = null;
const listeners = new Set<(next: AlexChatState) => void>();

function readAlexChat(): AlexChatState {
  if (memory) return memory;
  const saved = storage.getItem<AlexChatState>(STORAGE_KEYS.ALEX_CHAT, defaultAlexChatState);
  memory = saved;
  return saved;
}

export function useAlexChat() {
  const [state, setState] = useState<AlexChatState>(() => memory ?? defaultAlexChatState);
  const [ready, setReady] = useState(() => memory !== null);

  useEffect(() => {
    const onChange = (next: AlexChatState) => setState(next);
    listeners.add(onChange);
    setState(readAlexChat());
    setReady(true);
    return () => {
      listeners.delete(onChange);
    };
  }, []);

  const update = (next: AlexChatState) => {
    memory = next;
    storage.setItem(STORAGE_KEYS.ALEX_CHAT, next);
    listeners.forEach((listener) => listener(next));
  };

  return [state, update, ready] as const;
}

'use client';

import { useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { initialContextValue, useOnboardingMachine } from '../_machines/onboarding-machine';
import UserTextMessage from './user-text-message';
import BotTextMessage from './bot-text-message';
import OptionButton from './option-button';
import type {
  Message,
  OnboardingOptionEvent,
  OnboardingContext,
} from '../_machines/onboarding-machine';
import PostMessage from './post-message';
import POSTS from '../_posts';
import { STORAGE_KEYS, getStorage, storage as localStorage } from '@/lib/local-storage';
import TypingMessage from './typing-message';
import { CHAT_USERS } from '../../_constants/users';
import { useRouter } from '@/i18n/routing';

interface StoredOnboardingState {
  context: OnboardingContext | undefined;
  state: string | undefined;
}


export default function OnboardingFlow() {
  const locale = useLocale();
  const t = useTranslations('chat.onboarding');
  const storage = getStorage<StoredOnboardingState>(STORAGE_KEYS.CHAT_ONBOARDING_STATE);
  const { context, state: initialState } = storage.getItem({
    context: initialContextValue,
    state: 'initial',
  });
  const [state, send, { currentOptions, isCompleted }] = useOnboardingMachine(
    context,
    initialState
  );
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const post = POSTS[locale];

  useEffect(() => {
    if (isCompleted) {
      storage.removeItem();
    } else {
      storage.setItem({
        context: state.context,
        state: state.value,
      });
    }
  }, [storage, state, isCompleted]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.context.messages]);

  const handleOptionClick = (optionId: string, translationKey: string) => {
    send({
      type: optionId,
      optionText: translationKey,
    } as OnboardingOptionEvent);
  };

  // Move navigation and localStorage set to useEffect
  useEffect(() => {
    if (isCompleted) {
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
      router.replace('/');
    }
  }, [isCompleted, router]);

  if (isCompleted) {
    return null;
  }

  return (
    <div className="flex h-full flex-col w-full">
      {/* Messages Container */}
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6">
        {state.context.messages.map((message: Message) => {
          const sender = CHAT_USERS[message.sender as keyof typeof CHAT_USERS];
          switch (message.type) {
            case 'text':
              return message.sender === 'user' ? (
                <UserTextMessage
                  key={message.id}
                  displayText={t(message.text)}
                />
              ) : (
                <BotTextMessage
                  key={message.id}
                  senderName={sender.name}
                  senderAvatar={sender.avatar}
                  displayText={t(message.text)}
                />
              );
            case 'post':
              return (
                <PostMessage
                  key={message.id}
                  name={message.post.name}
                  handle={message.post.handle}
                  content={post[message.post.contentKey as keyof typeof post] as React.ReactNode}
                  mediaUrl={message.post.mediaUrl}
                  mediaType={message.post.mediaType}
                />
              );
            case 'typing':
              return (  
                <TypingMessage
                  key={message.id}
                  senderName={sender.name}
                  senderAvatar={sender.avatar}
                />
              );
            default:
              return null;
          }
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Options Container */}
      {!state.context.typing && currentOptions.length > 0 && (
        <div className="border-t border-[#E8E9ED] bg-white px-4 py-4 md:pb-4">
          <div className="mx-auto flex max-w-2xl flex-col gap-3">
            {currentOptions.map((option) => (
              <OptionButton
                key={option.id}
                id={option.id}
                displayText={t(option.translationKey)}
                onClick={() => handleOptionClick(option.id, option.translationKey)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

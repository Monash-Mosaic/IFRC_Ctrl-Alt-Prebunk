'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { initialContextValue, useOnboardingMachine } from '../_machines/onboarding-machine';
import OptionButton from './option-button';
import type { OnboardingOptionEvent, OnboardingContext } from '../_machines/onboarding-machine';
import OnboardingConversation, { practiceItem } from './onboarding-conversation';
import type { OnboardingHistory } from '../_lib/onboarding-history';
import { STORAGE_KEYS, getStorage, storage as localStorage } from '@/lib/local-storage';
import { useRouter } from '@/i18n/routing';
import MCQPostMessage from '@/components/newfeeds/mcq-post-message';

interface StoredOnboardingState {
  context: OnboardingContext | undefined;
  state: string | undefined;
  practiceAnswer?: string | null;
}

const storage = getStorage<StoredOnboardingState>(STORAGE_KEYS.CHAT_ONBOARDING_STATE);

const VALID_ONBOARDING_STATES = [
  'initial',
  'step2',
  'step3',
  'practice',
  'example-handoff',
  'completed',
];

export default function OnboardingFlow() {
  const t = useTranslations('chat.onboarding');
  const [persisted] = useState(() =>
    storage.getItem({ context: initialContextValue, state: 'initial' })
  );
  // Guard against stale persisted state referencing a state that no longer exists in the
  // machine (e.g. the removed `example` state) — fall back to a fresh initial state instead
  // of crashing when the machine library looks up an unknown state name.
  const isPersistedStateValid = VALID_ONBOARDING_STATES.includes(persisted.state ?? '');
  const context = isPersistedStateValid ? persisted.context : initialContextValue;
  const initialState = isPersistedStateValid ? persisted.state : 'initial';
  const [state, send, { currentOptions, isCompleted }] = useOnboardingMachine(
    context,
    initialState
  );
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [exampleAnswer, setExampleAnswer] = useState(persisted.practiceAnswer ?? null);
  const isPracticeState = state.value === 'practice' || state.value === 'example-handoff';

  useEffect(() => {
    if (isCompleted) {
      const history: OnboardingHistory = {
        messages: state.context.messages.filter((message) => message.type !== 'typing'),
        practiceAnswer: exampleAnswer,
        finalReply:
          'optionText' in state.event && typeof state.event.optionText === 'string'
            ? state.event.optionText
            : undefined,
      };
      localStorage.setItem(STORAGE_KEYS.PAULA_CHAT_HISTORY, history);
      storage.removeItem();
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
      router.replace('/');
      return;
    }

    storage.setItem({
      context: state.context,
      state: state.value,
      practiceAnswer: exampleAnswer,
    });
  }, [state, isCompleted, exampleAnswer, router]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (state.context.messages.length === 0 && !exampleAnswer) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.context.messages, exampleAnswer]);

  const handleOptionClick = (optionId: string, translationKey: string) => {
    send({
      type: optionId,
      optionText: translationKey,
    } as OnboardingOptionEvent);
  };

  const handleReturnHome = () => {
    storage.removeItem();
    router.replace('/');
  };

  const handlePracticeAnswer = (_postId: string, answer: string) => {
    if (exampleAnswer) return;
    setExampleAnswer(answer);
    send({ type: 'PRACTICE_ANSWERED' });
  };

  const canReturnHome =
    !state.context.typing &&
    (state.value === 'step2' || state.value === 'step3' || isPracticeState);

  if (isCompleted) {
    return null;
  }

  return (
    <div className="flex h-full flex-col w-full">
      {/* Messages Container */}
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6">
        <OnboardingConversation
          messages={state.context.messages}
          practiceAnswer={isPracticeState ? exampleAnswer : null}
        >
          {isPracticeState && !state.context.typing && (
            <div className="mb-4">
              <MCQPostMessage
                postId={practiceItem.id}
                user={practiceItem.post.user}
                content={practiceItem.post.content}
                mediaUrl={practiceItem.post.mediaUrl}
                mediaType={practiceItem.post.mediaType}
                options={practiceItem.options}
                correctOptionId={practiceItem.correctOptionId}
                answer={exampleAnswer}
                onAnswer={handlePracticeAnswer}
              />
            </div>
          )}
        </OnboardingConversation>
        <div ref={messagesEndRef} />
      </div>

      {/* Options Container */}
      {!state.context.typing && (currentOptions.length > 0 || canReturnHome) && (
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
            {canReturnHome && (
              <OptionButton
                id="return-home"
                displayText={t('returnHome')}
                onClick={handleReturnHome}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

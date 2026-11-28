'use client';

import { useTranslations } from 'next-intl';
import { ChevronRight } from 'lucide-react';
import PaulaAvatar from './onboarding/_icons/paula-avatar';
import AlexAvatar from './onboarding/_icons/alex-avatar';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { useAlexChat } from '@/lib/use-alex-chat';
import { useGameCompleted, useOnboardingCompleted } from '@/lib/use-game-store';
import { useHasOnboardingHistory } from './onboarding/_lib/onboarding-history';

interface ChatListItemProps {
  name: string;
  avatar: React.ReactNode;
  subText?: string;
  isDisabled?: boolean;
  isComplete?: boolean;
  isReview?: boolean;
  href: '/chat/onboarding' | '/chat/alex';
}

function ChatListItem({
  name,
  avatar,
  subText,
  isDisabled = false,
  isComplete = false,
  isReview = false,
  href,
}: ChatListItemProps) {
  const className = cn(
    'flex items-center justify-between w-full gap-3 rounded-3xl border border-dashed px-6 py-4 min-h-[60px]',
    isComplete
      ? 'cursor-default border-[#011E41]/50 bg-[#E4EAF3]/50'
      : 'border-[#011E41] bg-[#E4EAF3]',
    isDisabled && 'cursor-not-allowed opacity-50'
  );
  const content = (
    <>
      <span className={cn('flex items-center gap-3', isComplete && 'opacity-50')}>
        <span className="h-10 w-10 flex items-center justify-center">{avatar}</span>
        <span className="text-lg font-bold text-[#011E41]">{name}</span>
      </span>
      {subText && (
        <span className="flex items-center gap-2 text-end">
          <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
          <span className="text-sm font-medium text-red-600">{subText}</span>
        </span>
      )}
      {isReview && (
        <ChevronRight
          size={20}
          className="shrink-0 text-[#011E41] rtl:rotate-180"
          aria-hidden="true"
        />
      )}
    </>
  );

  return isComplete ? (
    <button type="button" className={className} disabled>
      {content}
    </button>
  ) : (
    <Link
      className={className}
      href={href}
      onClick={(event) => {
        if (isDisabled) event.preventDefault();
      }}
    >
      {content}
    </Link>
  );
}

export default function ChatPage() {
  const t = useTranslations('chat.list');
  const [alexChat] = useAlexChat();
  const gameCompleted = useGameCompleted();
  const onboardingCompleted = useOnboardingCompleted();
  const hasOnboardingHistory = useHasOnboardingHistory();
  const canReviewPaula = onboardingCompleted && hasOnboardingHistory;
  const alexOpen = alexChat.notified || alexChat.reply !== null;

  return (
    <div className="mx-auto flex flex-col md:px-4 md:pt-6 px-4">
      <div className="flex justify-center items-center text-2xl font-bold text-[#011E41] pt-4">
        {t('title')}
      </div>
      <div className="mx-auto flex items-start h-[calc(100vh-10rem)] max-w-md flex-col w-full">
        <div className="w-full space-y-4 pt-4">
          {(!gameCompleted || canReviewPaula) && (
            <ChatListItem
              name={t('paula')}
              avatar={<PaulaAvatar />}
              subText={onboardingCompleted ? undefined : t('newMessage')}
              isComplete={onboardingCompleted && !canReviewPaula}
              isReview={canReviewPaula}
              href="/chat/onboarding"
            />
          )}
          {(!gameCompleted || alexChat.reply) && (
            <ChatListItem
              name={t('alex')}
              avatar={<AlexAvatar />}
              subText={alexChat.reply ? undefined : t(alexOpen ? 'newMessage' : 'busy')}
              isReview={alexChat.reply !== null}
              isDisabled={!alexOpen}
              href="/chat/alex"
            />
          )}
        </div>
      </div>
    </div>
  );
}

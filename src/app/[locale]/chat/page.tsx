'use client';

import { useTranslations } from 'next-intl';
import PaulaAvatar from './onboarding/_icons/paula-avatar';
import AlexAvatar from './onboarding/_icons/alex-avatar';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { useAlexChat } from '@/lib/use-alex-chat';
import { useGameCompleted, useQuizInProgress } from '@/lib/use-game-store';

interface ChatListItemProps {
  name: string;
  avatar: React.ReactNode;
  subText: string;
  hasSubText?: boolean;
  isDisabled?: boolean;
  isComplete?: boolean;
  href: '/chat/onboarding' | '/chat/alex';
}

function ChatListItem({
  name,
  avatar,
  subText,
  hasSubText = false,
  isDisabled = false,
  isComplete = false,
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
      {hasSubText && (
        <span className="flex items-center gap-2 text-end">
          {!isComplete && <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />}
          <span className={cn('text-sm font-medium', isComplete ? 'text-slate-600' : 'text-red-600')}>
            {subText}
          </span>
        </span>
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
  const quizInProgress = useQuizInProgress();
  const alexOpen = alexChat.notified || alexChat.reply !== null;

  return (
    <div className="mx-auto flex flex-col md:px-4 md:pt-6 px-4">
      <div className="flex justify-center items-center text-2xl font-bold text-[#011E41] pt-4">
        {t('title')}
      </div>
      <div className="mx-auto flex items-start h-[calc(100vh-10rem)] max-w-md flex-col w-full">
        <div className="w-full space-y-4 pt-4">
          <ChatListItem
            name={t('paula')}
            avatar={<PaulaAvatar />}
            subText={quizInProgress ? t('onboardingComplete') : t('newMessage')}
            hasSubText
            isComplete={quizInProgress}
            href="/chat/onboarding"
          />
          {(!gameCompleted || alexChat.reply) && (
            <ChatListItem
              name={t('alex')}
              avatar={<AlexAvatar />}
              subText={alexOpen ? t('newMessage') : t('busy')}
              hasSubText={!alexChat.reply}
              isDisabled={!alexOpen}
              href="/chat/alex"
            />
          )}
        </div>
      </div>
    </div>
  );
}

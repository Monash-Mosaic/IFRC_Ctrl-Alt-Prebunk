'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import PaulaAvatar from './onboarding/_icons/paula-avatar';
import AlexAvatar from './onboarding/_icons/alex-avatar';

interface ChatListItemProps {
  name: string;
  avatar: React.ReactNode;
  newMessageText: string;
  href: '/chat/onboarding' | '/chat/alex';
  hasNewMessage?: boolean;
}

function ChatListItem({ name, avatar, newMessageText, href, hasNewMessage = false }: ChatListItemProps) {
  return (
    <Link
      href={href}
      className="flex min-h-[60px] w-full items-center justify-between rounded-3xl border-1 border-dashed border-[#011E41] bg-[#E4EAF3] px-6 py-4 transition-colors hover:bg-[#D8E1EE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#011E41]"
      aria-label={name}
    >
      <div className="flex items-center gap-3">
        <span className="h-10 w-10 flex items-center justify-center">
          {avatar}
        </span>
        <span className="text-lg font-bold text-[#011E41]">{name}</span>
      </div>
      {hasNewMessage && (
        <div className="right-6 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-500"></span>
          <span className="text-sm font-medium text-red-600">{newMessageText}</span>
        </div>
      )}
    </Link>
  );
}

export default function ChatPage() {
  const t = useTranslations('chat.list');

  return (
    <div className="mx-auto flex flex-col md:px-4 md:pt-6">
      <div className='flex justify-center items-center text-2xl font-bold text-[#011E41] pt-4'>{t('title')}</div>
      <div className="mx-auto flex items-start h-[calc(100vh-10rem)] max-w-md flex-col w-full">
        <div className="w-full space-y-4 pt-4">
          <ChatListItem
            name={t('paula')}
            avatar={<PaulaAvatar />}
            newMessageText={t('newMessage')}
            href="/chat/onboarding"
            hasNewMessage={true}
          />
          <ChatListItem
            name={t('alex')}
            avatar={<AlexAvatar />}
            newMessageText={t('newMessage')}
            href="/chat/alex"
            hasNewMessage={false}
          />
        </div>
      </div>
    </div>
  );
}

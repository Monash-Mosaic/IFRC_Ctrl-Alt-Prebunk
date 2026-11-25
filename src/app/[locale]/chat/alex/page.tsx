'use client';

import loadDynamicComponent from 'next/dynamic';
import Loading from '@/components/loading';
import { useTranslations } from 'next-intl';
import ChatHeadline from '../onboarding/_components/chat-headline';
import AlexAvatar from '../onboarding/_icons/alex-avatar';
import { CHAT_USERS } from '../_constants/users';

export const dynamic = 'force-dynamic';

function AlexLoadingFallback() {
  const t = useTranslations('common');
  return <Loading displayText={t('loading')} />;
}

const AlexFlow = loadDynamicComponent(() => import('./_components/alex-flow'), {
  ssr: false,
  loading: AlexLoadingFallback,
});

export default function AlexPage() {
  return (
    <div className="mx-auto flex flex-col md:px-4 md:pt-6">
      <ChatHeadline name={CHAT_USERS.alex.name} avatar={<AlexAvatar width={32} height={32} />} />
      <div className="mx-auto flex h-[calc(100vh-10rem)] w-full max-w-md flex-col items-center justify-center">
        <AlexFlow />
      </div>
    </div>
  );
}

'use client';

import dynamic from 'next/dynamic';
import Loading from '@/components/loading';
import { useTranslations } from 'next-intl';
import ChatHeadline from './_components/chat-headline';
import { CHAT_USERS } from '../_constants/users';

export default function OnboardingPage() {
  const t = useTranslations('common');
  const OnboardingFlow = dynamic(() => import('./_components/onboarding-flow'), {
    ssr: false,
    loading: () => <Loading displayText={t('loading')} />,
  });

  return (
    <div className="mx-auto flex flex-col md:px-4 md:pt-6">
      {/* Headline */}
      <ChatHeadline name={CHAT_USERS.paula.name} />
      <div className="mx-auto flex items-center justify-center h-[calc(100vh-10rem)] max-w-md flex-col w-full">
        <OnboardingFlow />
      </div>
    </div>
  );
}

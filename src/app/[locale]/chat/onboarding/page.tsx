'use client';

import loadDynamicComponent from 'next/dynamic';
import { useEffect, useState } from 'react';
import Loading from '@/components/loading';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { isQuizInProgress } from '@/lib/use-game-store';
import ChatHeadline from './_components/chat-headline';
import PaulaAvatar from './_icons/paula-avatar';
import { CHAT_USERS } from '../_constants/users';

export const dynamic = 'force-dynamic';

function OnboardingLoadingFallback() {
  const t = useTranslations('common');
  return <Loading displayText={t('loading')} />;
}

const OnboardingFlow = loadDynamicComponent(() => import('./_components/onboarding-flow'), {
  ssr: false,
  loading: OnboardingLoadingFallback,
});

export default function OnboardingPage() {
  const router = useRouter();
  const [canOpenOnboarding, setCanOpenOnboarding] = useState(false);

  useEffect(() => {
    if (isQuizInProgress()) {
      router.replace('/chat');
      return;
    }

    setCanOpenOnboarding(true);
  }, [router]);

  return (
    <div className="mx-auto flex flex-col max-md:h-[calc(100dvh-10rem)] md:px-4 md:pt-6">
      {/* Headline */}
      <ChatHeadline
        name={CHAT_USERS.paula.name}
        avatar={<PaulaAvatar width={32} height={32} />}
      />
      <div className="mx-auto flex items-center justify-center max-md:min-h-0 max-md:flex-1 md:h-[calc(100vh-10rem)] max-w-md flex-col w-full">
        {canOpenOnboarding ? <OnboardingFlow /> : <OnboardingLoadingFallback />}
      </div>
    </div>
  );
}

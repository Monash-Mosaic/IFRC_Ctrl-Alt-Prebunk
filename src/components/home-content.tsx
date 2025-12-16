'use client';

import ChatContent from '@/components/chat-content';
import UnderDevelopment from '@/components/under-development';
import { useTranslations } from 'next-intl';
import { storage, STORAGE_KEYS } from '@/lib/local-storage';

export default function HomeContent() {
  const t = useTranslations('chat');
  const underDevelopment = useTranslations('underDevelopment');

  const onboardingCompleted = Boolean(storage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED, false));
  if (!onboardingCompleted) {
    return <ChatContent startOnboardingText={t('startOnboarding')} skipText={t('skip')} />;
  }

  return <UnderDevelopment title={underDevelopment('title')} message={underDevelopment('message')} />;
}

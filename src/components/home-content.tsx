'use client';

import ChatContent from '@/components/chat-content';
import UnderDevelopment from '@/components/under-development';
import { useTranslations } from 'next-intl';
import { STORAGE_KEYS } from '@/lib/local-storage';
import { useLocalStorage } from '@/lib/use-local-storage';

export default function HomeContent() {
  const t = useTranslations('chat');
  const underDevelopment = useTranslations('underDevelopment');
  const [onboardingCompleted, setOnboardingCompleted] = useLocalStorage<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETED, false);


  const handleSkipClick = () => {
    setOnboardingCompleted(true);
  };

  if (!onboardingCompleted) {
    return <ChatContent startOnboardingText={t('startOnboarding')} skipText={t('skip')} onSkipClick={handleSkipClick} />;
  }

  return <UnderDevelopment title={underDevelopment('title')} message={underDevelopment('message')} />;
}

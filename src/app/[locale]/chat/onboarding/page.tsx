'use client';

import loadDynamicComponent from 'next/dynamic';
import { useEffect, useState } from 'react';
import Loading from '@/components/loading';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { isOnboardingCompleted } from '@/lib/use-game-store';
import PostMessage from '@/components/post-message';
import { getOnboardingHistory, type OnboardingHistory } from './_lib/onboarding-history';
import OnboardingConversation, { practiceItem } from './_components/onboarding-conversation';
import OptionButton from './_components/option-button';
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
  const t = useTranslations('chat.list');
  const [view, setView] = useState<'live' | OnboardingHistory | null>(null);

  useEffect(() => {
    if (isOnboardingCompleted()) {
      const history = getOnboardingHistory();
      if (history) setView(history);
      else router.replace('/chat');
      return;
    }

    setView('live');
  }, [router]);

  return (
    <div className="mx-auto flex flex-col max-md:h-[calc(100dvh-10rem)] md:px-4 md:pt-6">
      {/* Headline */}
      <ChatHeadline name={CHAT_USERS.paula.name} avatar={<PaulaAvatar width={32} height={32} />} />
      <div className="mx-auto flex items-center justify-center max-md:min-h-0 max-md:flex-1 md:h-[calc(100vh-10rem)] max-w-md flex-col w-full">
        {view === 'live' ? (
          <OnboardingFlow />
        ) : view ? (
          <div className="flex h-full w-full min-h-0 flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6">
              <OnboardingConversation {...view}>
                {view.practiceAnswer && <PostMessage {...practiceItem.post} />}
              </OnboardingConversation>
            </div>
            <div className="border-t border-[#E8E9ED] bg-white px-4 py-4">
              <OptionButton
                id="paula-messages"
                displayText={t('backToMessages')}
                onClick={() => router.replace('/chat')}
              />
            </div>
          </div>
        ) : (
          <OnboardingLoadingFallback />
        )}
      </div>
    </div>
  );
}

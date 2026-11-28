'use client';

import { useLocale, useTranslations } from 'next-intl';
import CONTENTS from '@/contents';
import { useRouter } from '@/i18n/routing';
import { useAlexChat } from '@/lib/use-alex-chat';
import { useFeedCompleted, useGameCompleted } from '@/lib/use-game-store';
import OptionButton from '../onboarding/_components/option-button';

export default function ChatExitButton({ id }: { id: string }) {
  const t = useTranslations('chat');
  const locale = useLocale() as keyof typeof CONTENTS;
  const router = useRouter();
  const [{ reply }] = useAlexChat();
  const gameCompleted = useGameCompleted();
  const feedCompleted = useFeedCompleted(CONTENTS[locale].contentList);
  const resultsReady = gameCompleted || (feedCompleted && reply !== null);

  return (
    <OptionButton
      id={id}
      displayText={t(resultsReady ? 'viewMyResults' : 'backToFeed')}
      onClick={() => router.replace('/')}
    />
  );
}

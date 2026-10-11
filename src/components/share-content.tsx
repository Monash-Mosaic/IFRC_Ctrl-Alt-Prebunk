'use client';

import { useCallback, useEffect, useState } from 'react';
import Modal from 'react-modal';
import { useLocale, useTranslations } from 'next-intl';
import { BookOpen, Gamepad2, GraduationCap, Share2, Trophy } from 'lucide-react';
import CONTENTS from '@/contents';
import ShareProgressModal from '@/components/share-progress-modal';
import type { ShareProgressResult } from '@/components/share-progress';
import Toast from '@/components/toast';
import {
  GAME_URL,
  SOLFERINO_ACADEMY_URL,
  WORLD_DISASTERS_REPORT_URL,
  shareLink,
  type ShareLinkResult,
} from '@/lib/share-links';
import { getStoredGameProgress } from '@/lib/use-game-store';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#011E41] focus-visible:ring-offset-2';

const actionButtonClass = cn(
  'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition',
  focusRing
);

type LinkKey = 'game' | 'report' | 'academy';

const LINK_OPTIONS: { key: LinkKey; url: string; icon: React.ReactNode }[] = [
  { key: 'game', url: GAME_URL, icon: <Gamepad2 size={24} strokeWidth={2} /> },
  { key: 'report', url: WORLD_DISASTERS_REPORT_URL, icon: <BookOpen size={24} strokeWidth={2} /> },
  { key: 'academy', url: SOLFERINO_ACADEMY_URL, icon: <GraduationCap size={24} strokeWidth={2} /> },
];

/**
 * Share destination: external sharing of the game, resources and the player's result.
 *
 * Read-only with respect to gameplay: nothing here writes the game or credibility
 * stores, so sharing (or cancelling) never resets or advances the simulation.
 */
export default function ShareContent() {
  const t = useTranslations('sharePage');
  const locale = useLocale();
  // Progress cannot change while this page is open, so a single read is enough.
  const [{ correctAnswers, gameCompleted }] = useState(getStoredGameProgress);
  const totalQuestions = CONTENTS[locale as keyof typeof CONTENTS].contentList.length;

  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof Modal.setAppElement === 'function') {
      Modal.setAppElement(document.body);
    }
  }, []);

  const handleCloseToast = useCallback(() => setToastMessage(null), []);

  const handleShareLink = async (key: LinkKey, url: string) => {
    const result: ShareLinkResult = await shareLink({
      title: t(`${key}.shareTitle`),
      text: t(`${key}.shareText`),
      url,
    });
    setToastMessage(
      result === 'failed' ? t('feedback.linkFailed', { url }) : t(`feedback.${result}`)
    );
  };

  const handleProgressResult = useCallback(
    (result: ShareProgressResult) => setToastMessage(t(`feedback.${result}`)),
    [t]
  );

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-6 md:max-w-lg md:py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-[#011E41]">{t('title')}</h1>
        <p className="text-sm text-[#6B7280]">{t('subtitle')}</p>
      </div>

      <ul className="flex flex-col gap-4">
        {LINK_OPTIONS.map(({ key, url, icon }) => (
          <li key={key}>
            <ShareCard icon={icon} title={t(`${key}.title`)} description={t(`${key}.description`)}>
              <button
                type="button"
                onClick={() => handleShareLink(key, url)}
                className={cn(
                  actionButtonClass,
                  'border border-dashed border-[#011E41] bg-white/60 text-[#011E41] hover:bg-white'
                )}
              >
                <Share2 size={16} strokeWidth={2} aria-hidden="true" />
                {t(`${key}.action`)}
              </button>
            </ShareCard>
          </li>
        ))}

        <li>
          <ShareCard
            icon={<Trophy size={24} strokeWidth={2} />}
            title={t('progress.title')}
            description={
              gameCompleted
                ? t('progress.result', { score: `${correctAnswers}/${totalQuestions}` })
                : t('progress.locked')
            }
            descriptionId="share-progress-description"
          >
            <button
              type="button"
              onClick={() => setIsProgressModalOpen(true)}
              disabled={!gameCompleted}
              aria-describedby="share-progress-description"
              className={cn(
                actionButtonClass,
                'bg-[#011E41] text-white hover:bg-[#002552] disabled:cursor-not-allowed disabled:bg-[#6B7280] disabled:opacity-60'
              )}
            >
              <Share2 size={16} strokeWidth={2} aria-hidden="true" />
              {t('progress.action')}
            </button>
          </ShareCard>
        </li>
      </ul>

      {gameCompleted && (
        <ShareProgressModal
          isOpen={isProgressModalOpen}
          onClose={() => setIsProgressModalOpen(false)}
          correctAnswers={correctAnswers}
          totalQuestions={totalQuestions}
          onResult={handleProgressResult}
        />
      )}

      <Toast
        message={toastMessage ?? ''}
        isVisible={toastMessage !== null}
        onClose={handleCloseToast}
        // Sit above the fixed mobile bottom nav (4rem).
        className="z-[110] max-md:bottom-20"
      />
    </div>
  );
}

interface ShareCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  descriptionId?: string;
  children: React.ReactNode;
}

function ShareCard({ icon, title, description, descriptionId, children }: ShareCardProps) {
  return (
    <section className="flex flex-col gap-4 rounded-3xl bg-[#E4EAF3] p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#011E41]"
          aria-hidden="true"
        >
          {icon}
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="text-base font-semibold text-[#011E41]">{title}</h2>
          <p id={descriptionId} className="text-sm text-slate-700">
            {description}
          </p>
        </div>
      </div>
      {children}
    </section>
  );
}

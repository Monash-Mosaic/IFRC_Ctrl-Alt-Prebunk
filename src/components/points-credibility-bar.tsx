'use client';

import { useCredibilityStore } from '@/lib/use-credibility-store';
import { useTranslations, useLocale } from 'next-intl';
import CONTENTS from '@/contents';

export default function PointsCredibilityBar() {
  const t = useTranslations('header');
  const locale = useLocale();
  const { points, credibility, initialCredibility } = useCredibilityStore((state) => state);

  const credibilityPercentage = (credibility / Math.max(initialCredibility, 1)) * 100;
  const correctAnswers = points / 5;
  const totalQuestions = CONTENTS[locale as keyof typeof CONTENTS].contentList.length;

  return (
    <div className="flex justify-between fixed top-14 left-0 right-0 z-40 flex h-10 items-center gap-4 border-t border-white/50 bg-[#E8E9ED] px-4 md:px-6">
      {/* Score */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-[#0D1B3E]">
          {t('score')}: {correctAnswers}/{totalQuestions}
        </span>
      </div>

      {/* Credibility */}
      <div className="flex flex-1 items-center gap-3 max-w-[500px]">
        <span className="text-sm font-medium text-[#0D1B3E]">{t('credibility')}</span>
        <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-white">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-[#2FE89F] transition-all duration-500"
            style={{ width: `${credibilityPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

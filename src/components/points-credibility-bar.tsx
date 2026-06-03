'use client';

import { useCredibilityStore } from '@/lib/use-credibility-store';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const BADGE_NAMES = ['Misinformation Fighter', 'Prebunking Hero', 'Prebunking Champion'];

export default function PointsCredibilityBar() {
  const t = useTranslations('header');
  const { points, credibility, initialCredibility, earnedBadges } = useCredibilityStore((state) => state);

  const credibilityPercentage = (credibility / Math.max(initialCredibility, 1)) * 100;

  return (
    <div className="flex justify-between fixed top-14 left-0 right-0 z-40 flex h-10 items-center gap-4 border-t border-white/50 bg-[#E8E9ED] px-4 md:px-6">
      {/* Points */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-[#0D1B3E]">
          {t('points')}: {points}
        </span>
        {/* Badge circles */}
        <div className="flex gap-1">
          {BADGE_NAMES.map((name, index) => {
            const isEarned = earnedBadges.includes(index);
            return (
              <div
                key={index}
                title={name}
                className={`relative w-5 h-5 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${isEarned ? 'bg-amber-400 scale-110' : 'bg-gray-300'
                  }`}
                style={isEarned ? { animation: 'badge-earn 1.6s ease-in-out' } : undefined}
              >
                {isEarned ? (
                  <Image src="/images/trophy.png" alt={name} width={16} height={16} className="object-contain" />
                ) : (
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                )}
              </div>
            );
          })}
        </div>
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

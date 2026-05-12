'use client';

import { useCredibilityStore } from '@/lib/use-credibility-store';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function PointsCredibilityBar() {
  const t = useTranslations('header');
  const { point, credibility, badges } = useCredibilityStore((state) => state);

  return (
    <div className="flex justify-between fixed top-14 left-0 right-0 z-40 flex h-10 items-center gap-4 border-t border-white/50 bg-[#E8E9ED] px-4 md:px-6">
      {/* Points */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-[#0D1B3E]">
          {t('points')}: {point}
        </span>
        {/* Badge circles */}
        <div className="flex gap-1">
          {badges.map((badge, index) => (
            <Image
              key={`${badge}-${index}`}
              src="/images/trophy.png"
              alt={badge}
              width={20}
              height={20}
              className="object-contain"
            />
          ))}
        </div>
      </div>

      {/* Credibility */}
      <div className="flex flex-1 items-center gap-3 max-w-[500px]">
        <span className="text-sm font-medium text-[#0D1B3E]">{t('credibility')}</span>
        <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-white">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-[#2FE89F] transition-all duration-500"
            style={{ width: `${credibility}%` }}
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useTranslations } from "next-intl";

interface PointsCredibilityBarProps {
  points?: number;
  credibility?: number;
}

export default function PointsCredibilityBar({
  points = 0,
  credibility = 80,
}: PointsCredibilityBarProps) {
  const t = useTranslations("header");

  return (
    <div className="fixed top-14 left-0 right-0 z-40 flex h-10 items-center gap-4 border-t border-white/50 bg-[#E8E9ED] px-4 md:px-6">
      {/* Points */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-[#0D1B3E]">
          {t("points")}: {points}
        </span>
        {/* Badge circles */}
        <div className="flex gap-1">
          <div className="h-5 w-5 rounded-full bg-[#C5C9D3]" />
          <div className="h-5 w-5 rounded-full bg-[#C5C9D3]" />
          <div className="h-5 w-5 rounded-full bg-[#C5C9D3]" />
        </div>
      </div>

      {/* Credibility */}
      <div className="flex flex-1 items-center gap-3">
        <span className="text-sm font-medium text-[#0D1B3E]">{t("credibility")}</span>
        <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-white">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-[#2FE89F] transition-all duration-500"
            style={{ width: `${credibility}%` }}
          />
          {/* Slider indicator */}
          <div
            className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-white bg-[#2FE89F] shadow-md transition-all duration-500"
            style={{ left: `calc(${credibility}% - 10px)` }}
          />
        </div>
      </div>
    </div>
  );
}


'use client';

import { useState } from 'react';
import { CornerUpLeft, ThumbsUp, ThumbsDown, MessageCircle, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { MCQOption, User } from '@/contents/en';

export interface MCQPostMessageProps {
  postId: string;
  user: User;
  content: React.ReactNode;
  options: MCQOption[];
  correctOptionId: string;
  answer: string | null | undefined;
  whyCorrectAnswer: { title: React.ReactNode; content: React.ReactNode };
  whyIncorrectAnswer: { title: React.ReactNode; content: React.ReactNode };
  isDisabled?: boolean;
  onAnswer: (postId: string, optionId: string) => void;
  onContinue: (postId: string) => void;
}

export default function MCQPostMessage({
  postId,
  user,
  content,
  options,
  correctOptionId,
  answer,
  whyCorrectAnswer,
  whyIncorrectAnswer,
  isDisabled = false,
  onAnswer,
  onContinue,
}: MCQPostMessageProps) {
  const t = useTranslations('prebunking');
  const [overlayDismissed, setOverlayDismissed] = useState(false);

  const hasAnswered = answer != null;
  const isCorrect = hasAnswered && answer === correctOptionId;
  const showOverlay = hasAnswered && !overlayDismissed;

  const handleContinue = () => {
    setOverlayDismissed(true);
    onContinue(postId);
  };

  const getOptionClass = (optionId: string) => {
    if (!hasAnswered) {
      return 'bg-white border-[#011E41] text-[#011E41] hover:bg-[#E4EAF3] cursor-pointer';
    }
    const isSelected = answer === optionId;
    const isThisCorrect = optionId === correctOptionId;

    if (isSelected && isCorrect) {
      return 'bg-[#00FF9C] border-[#011E41] text-[#011E41] cursor-not-allowed';
    }
    if (isSelected && !isCorrect) {
      return 'bg-[#FF1E56] border-[#FF1E56] text-white cursor-not-allowed';
    }
    if (isThisCorrect) {
      return 'bg-[#00FF9C] border-[#011E41] text-[#011E41] cursor-not-allowed';
    }
    return 'bg-white border-[#E4EAF3] text-[#6B7280] cursor-not-allowed';
  };

  return (
    <article
      className={cn(
        'w-full rounded-lg border border-[#E8E9ED] bg-white p-4 shadow-sm relative overflow-hidden',
        isDisabled ? 'opacity-50 cursor-not-allowed' : ''
      )}
    >
      {/* Header */}
      <header className="mb-3 flex items-start gap-3">
        <div className="shrink-0 w-[40px] h-[40px] flex items-center justify-center" aria-hidden="true">
          {user.avatar}
        </div>
        <div className="flex flex-col items-start justify-between">
          {user.name && <h3 className="text-sm font-semibold text-[#0D1B3E]">{user.name}</h3>}
          {user.handle && <p className="text-xs text-[#6B7280]">{user.handle}</p>}
        </div>
      </header>

      {/* Question content */}
      <div className="mb-4 text-sm text-[#0D1B3E]">
        {content}
      </div>

      {/* Answer options */}
      <div className="space-y-2 mb-4">
        {options.map((option) => (
          <button
            key={option.id}
            disabled={hasAnswered || isDisabled}
            onClick={() => onAnswer(postId, option.id)}
            className={cn(
              'w-full text-left rounded-lg px-4 py-3 text-sm font-medium border transition-colors',
              getOptionClass(option.id)
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Social action bar (all disabled - MCQ interaction is via options) */}
      <div className="flex items-center justify-between border-t border-[#E8E9ED] pt-3">
        <div className="flex items-center gap-4">
          <button disabled className="flex items-center gap-1 text-(--color-ifrc-blue)/30 cursor-not-allowed" aria-label="Like" type="button">
            <ThumbsUp size={20} strokeWidth={2} aria-hidden="true" />
          </button>
          <button disabled className="flex items-center gap-1 text-(--color-ifrc-blue)/30 cursor-not-allowed" aria-label="Dislike" type="button">
            <ThumbsDown size={20} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button disabled className="flex items-center gap-1 text-(--color-ifrc-blue)/30 cursor-not-allowed" aria-label="Comment" type="button">
            <MessageCircle size={20} strokeWidth={2} aria-hidden="true" />
          </button>
          <button disabled className="flex items-center gap-1 text-(--color-ifrc-blue)/30 cursor-not-allowed" aria-label="Share" type="button">
            <Send size={20} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Inline overlay - shown after answering, dismissed on Continue */}
      {showOverlay && (
        <div className="absolute inset-0 z-10 flex flex-col bg-white rounded-lg overflow-auto">
          {/* Coloured header */}
          <div
            className={cn(
              'px-6 py-4 flex items-center gap-3 shrink-0',
              isCorrect ? 'bg-[#00FF9C]' : 'bg-[#FF1E56]'
            )}
          >
            <div className="shrink-0" aria-hidden="true">
              <CornerUpLeft
                className={isCorrect ? 'text-[#011E41]' : 'text-white'}
                size={24}
                strokeWidth={2.5}
              />
            </div>
            <div className={cn('text-sm font-semibold', isCorrect ? 'text-[#011E41]' : 'text-white')}>
              {isCorrect ? whyCorrectAnswer.title : whyIncorrectAnswer.title}
            </div>
          </div>

          {/* Explanation body */}
          <div className="flex-1 px-6 py-5 space-y-3 overflow-auto text-sm text-[#0D1B3E]">
            {isCorrect ? whyCorrectAnswer.content : whyIncorrectAnswer.content}
          </div>

          {/* Continue button */}
          <div className="px-6 pb-5 shrink-0">
            <button
              onClick={handleContinue}
              className={cn(
                'w-full rounded-lg bg-[#011E41] text-white font-semibold py-3 px-4',
                'transition-colors hover:bg-[#002A5A] active:bg-[#001A3F]',
                'focus:outline-none focus:ring-2 focus:ring-[#011E41] focus:ring-offset-2'
              )}
            >
              {t('continueButton')}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

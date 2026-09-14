'use client';

import PostMessage from '@/components/post-message';
import { cn } from '@/lib/utils';
import type { MCQOption, User } from '@/contents/en';

export interface MCQPostMessageProps {
  postId: string;
  user: User;
  content: React.ReactNode;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  options: MCQOption[];
  correctOptionId: string;
  answer: string | null | undefined;
  isDisabled?: boolean;
  onAnswer: (postId: string, optionId: string) => void;
}

export default function MCQPostMessage({
  postId,
  user,
  content,
  mediaUrl,
  mediaType,
  options,
  correctOptionId,
  answer,
  isDisabled = false,
  onAnswer,
}: MCQPostMessageProps) {
  const hasAnswered = answer != null;
  const isCorrect = hasAnswered && answer === correctOptionId;

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
    <PostMessage
      user={user}
      content={<div className="mb-4 text-sm text-[#0D1B3E]">{content}</div>}
      mediaUrl={mediaType === 'image' ? mediaUrl : undefined}
      mediaType={mediaType}
      mediaAlt="Question post"
      className={isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
      interaction={
        <div className="space-y-2 mb-4">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={answer === option.id}
              disabled={hasAnswered || isDisabled}
              onClick={() => onAnswer(postId, option.id)}
              className={cn(
                'w-full min-h-12 text-start rounded-lg px-4 py-3 text-sm font-medium border transition-colors',
                getOptionClass(option.id)
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      }
    />
  );
}

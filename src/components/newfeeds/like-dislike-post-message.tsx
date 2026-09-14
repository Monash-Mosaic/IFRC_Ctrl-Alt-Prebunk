'use client';

import { CircleAlert, ThumbsUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import PostMessage, { type PostMessageProps } from '@/components/post-message';
import { cn } from '@/lib/utils';

export interface LikeDislikePostMessageProps extends Omit<PostMessageProps, 'interaction'> {
  postId: string;
  answer: 'like' | 'dislike' | null | undefined;
  correctAnswer: 'like' | 'dislike';
  onLike?: (postId: string) => void;
  onDislike?: (postId: string) => void;
  isDisabled?: boolean;
}

const colors = {
  correctClass: 'fill-(--color-dunder-green)',
  incorrectClass: 'fill-(--color-dunder-red)',
};

export default function LikeDislikePostMessage({
  postId,
  user,
  onLike,
  onDislike,
  answer,
  correctAnswer,
  mediaUrl,
  mediaType,
  mediaAlt,
  content,
  className,
  isDisabled = false,
}: LikeDislikePostMessageProps) {
  const postActions = useTranslations('postActions');
  // Use answer from props (passed from parent)
  const currentAnswer = answer ?? null;
  const hasAnswered = currentAnswer !== null;
  const isCorrect = currentAnswer === correctAnswer;
  const isLikeDisabled = isDisabled || hasAnswered || !onLike;
  const isReportDisabled = isDisabled || hasAnswered || !onDislike;

  const handleLike = () => {
    if (!hasAnswered && !isDisabled) {
      onLike?.(postId);
    }
  };

  const handleDislike = () => {
    if (!hasAnswered && !isDisabled) {
      onDislike?.(postId);
    }
  };

  // Apply background fill only to the button that was clicked
  const likeClassName =
    hasAnswered && currentAnswer === 'like'
      ? isCorrect
        ? colors.correctClass
        : colors.incorrectClass
      : '';
  const dislikeClassName =
    hasAnswered && currentAnswer === 'dislike'
      ? isCorrect
        ? colors.correctClass
        : colors.incorrectClass
      : '';

  return (
    <PostMessage
      user={user}
      content={content}
      className={cn(isDisabled ? 'opacity-50 cursor-not-allowed' : '', className)}
      mediaUrl={mediaUrl}
      mediaType={mediaType}
      mediaAlt={mediaAlt}
      interaction={
        <div className="grid grid-cols-2 gap-3 border-t border-[#E8E9ED] pt-3">
          <button
            onClick={handleLike}
            disabled={isLikeDisabled}
            className={cn(
              'flex min-h-12 w-full min-w-0 items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-semibold text-(--color-ifrc-blue) transition-colors',
              'enabled:hover:bg-[#E4EAF3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#011E41] focus-visible:ring-offset-2 disabled:cursor-not-allowed',
              currentAnswer === 'like' ? 'border-[#011E41] bg-[#E4EAF3]' : 'border-transparent',
              isLikeDisabled && currentAnswer !== 'like' ? 'opacity-50' : ''
            )}
            aria-label={postActions('like')}
            aria-pressed={currentAnswer === 'like'}
            type="button"
          >
            <ThumbsUp
              className={cn('shrink-0', likeClassName)}
              size={22}
              strokeWidth={2}
              aria-hidden="true"
            />
            <span className="min-w-0 wrap-anywhere">{postActions('like')}</span>
          </button>
          <button
            disabled={isReportDisabled}
            onClick={handleDislike}
            className={cn(
              'flex min-h-12 w-full min-w-0 items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-semibold text-(--color-ifrc-blue) transition-colors',
              'enabled:hover:bg-[#E4EAF3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#011E41] focus-visible:ring-offset-2 disabled:cursor-not-allowed',
              currentAnswer === 'dislike' ? 'border-[#011E41] bg-[#E4EAF3]' : 'border-transparent',
              isReportDisabled && currentAnswer !== 'dislike' ? 'opacity-50' : ''
            )}
            aria-label={postActions('report')}
            aria-pressed={currentAnswer === 'dislike'}
            type="button"
          >
            <CircleAlert
              className={cn('shrink-0', dislikeClassName)}
              size={22}
              strokeWidth={2}
              aria-hidden="true"
            />
            <span className="min-w-0 wrap-anywhere">{postActions('report')}</span>
          </button>
        </div>
      }
    />
  );
}

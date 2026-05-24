'use client';

import PostMessage, { PostMessageProps } from '@/app/[locale]/chat/onboarding/_components/post-message';
import { User } from '@/contents/en';
import { GameAnswer } from '@/lib/use-game-store';

export interface LikeDislikePostMessageProps extends Omit<PostMessageProps, 'likeDisabled' | 'dislikeDisabled' | 'commentDisabled' | 'shareDisabled' | 'onLike' | 'onDislike' | 'onShare'> {
  postId: string;
  answer: GameAnswer | null | undefined;
  correctAnswer: 'like' | 'dislike';
  user: User;
  onLike?: (postId: string) => void;
  onDislike?: (postId: string) => void;
  onShare?: (postId: string) => void;
}

const colors = {
  correctClass: "fill-(--color-dunder-green)",
  incorrectClass: "fill-(--color-dunder-red)",
}

export default function LikeDislikePostMessage({
  postId,
  user,
  onLike,
  onDislike,
  onShare,
  answer,
  correctAnswer,
  mediaUrl,
  mediaType,
  content,
  ...postMessageProps
}: LikeDislikePostMessageProps) {
  // Use answer from props (passed from parent)
  const currentAnswer = answer ?? null;
  const hasAnswered = currentAnswer !== null && currentAnswer !== undefined;
  const isCorrect = currentAnswer === 'share'
    ? correctAnswer === 'like'
    : currentAnswer === correctAnswer;

  const handleLike = () => {
    if (!hasAnswered) {
      onLike?.(postId);
    }
  };

  const handleDislike = () => {
    if (!hasAnswered) {
      onDislike?.(postId);
    }
  };

  const handleShare = () => {
    if (!hasAnswered) {
      onShare?.(postId);
    }
  };

  // Apply background fill only to the button that was clicked
  const likeClassName = hasAnswered && currentAnswer === 'like'
    ? (isCorrect ? colors.correctClass : colors.incorrectClass)
    : '';
  const dislikeClassName = hasAnswered && currentAnswer === 'dislike'
    ? (isCorrect ? colors.correctClass : colors.incorrectClass)
    : '';
  const shareClassName = hasAnswered && currentAnswer === 'share'
    ? (isCorrect ? colors.correctClass : colors.incorrectClass)
    : '';

  return (
    <PostMessage
      user={user}
      content={content}
      onLike={handleLike}
      onDislike={handleDislike}
      onShare={handleShare}
      likeClassName={likeClassName}
      dislikeClassName={dislikeClassName}
      shareClassName={shareClassName}
      likeDisabled={hasAnswered}
      dislikeDisabled={hasAnswered}
      commentDisabled={true}
      shareDisabled={hasAnswered}
      mediaUrl={mediaUrl}
      mediaType={mediaType}
      {...postMessageProps}
    />
  );
}

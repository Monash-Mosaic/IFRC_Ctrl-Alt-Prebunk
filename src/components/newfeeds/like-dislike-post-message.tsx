'use client';

import { useState } from 'react';
import PostMessage, { PostMessageProps } from '@/app/[locale]/chat/onboarding/_components/post-message';
import PrebunkingModal from './prebunking-modal';

export interface LikeDislikePostMessageProps extends Omit<PostMessageProps, 'likeDisabled' | 'dislikeDisabled' | 'commentDisabled' | 'shareDisabled' | 'onLike' | 'onDislike'> {
  postId: string;
  onLike?: (postId: string) => void;
  onDislike?: (postId: string) => void;
  onEngaged?: (postId: string) => void;
}

export default function LikeDislikePostMessage({
  postId,
  onLike,
  onDislike,
  onEngaged,
  ...postMessageProps
}: LikeDislikePostMessageProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleLike = () => {
    if (isDisliked) {
      setIsDisliked(false);
    }
    setIsLiked(!isLiked);
    setShowModal(true);
    onLike?.(postId);
    // Mark as engaged immediately when like/dislike is clicked
    onEngaged?.(postId);
  };

  const handleDislike = () => {
    if (isLiked) {
      setIsLiked(false);
    }
    setIsDisliked(!isDisliked);
    setShowModal(true);
    onDislike?.(postId);
    // Mark as engaged immediately when like/dislike is clicked
    onEngaged?.(postId);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleContinue = () => {
    setShowModal(false);
    // Ensure engagement is tracked when user clicks Continue
    // (in case it wasn't tracked earlier, though it should be)
    onEngaged?.(postId);
  };

  return (
    <>
      <PostMessage
        {...postMessageProps}
        onLike={handleLike}
        onDislike={handleDislike}
        likeDisabled={false}
        dislikeDisabled={false}
        commentDisabled={true}
        shareDisabled={true}
      />
      <PrebunkingModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onContinue={handleContinue}
        postId={postId}
      />
    </>
  );
}

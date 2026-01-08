'use client';

import { useState } from 'react';
import PostMessage, { PostMessageProps } from '@/app/[locale]/chat/onboarding/_components/post-message';
import PrebunkingModal from './prebunking-modal';

export interface LikeDislikePostMessageProps extends Omit<PostMessageProps, 'likeDisabled' | 'dislikeDisabled' | 'commentDisabled' | 'shareDisabled' | 'onLike' | 'onDislike'> {
  postId: string;
  onLike?: (postId: string) => void;
  onDislike?: (postId: string) => void;
}

export default function LikeDislikePostMessage({
  postId,
  onLike,
  onDislike,
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
  };

  const handleDislike = () => {
    if (isLiked) {
      setIsLiked(false);
    }
    setIsDisliked(!isDisliked);
    setShowModal(true);
    onDislike?.(postId);
  };

  const handleCloseModal = () => {
    setShowModal(false);
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
        postId={postId}
      />
    </>
  );
}

'use client';

import { useReducer } from 'react';
import PostMessage, { PostMessageProps } from '@/app/[locale]/chat/onboarding/_components/post-message';
import PrebunkingModal from './prebunking-modal';
import { User } from '@/contents/en';

export interface LikeDislikePostMessageProps extends Omit<PostMessageProps, 'likeDisabled' | 'dislikeDisabled' | 'commentDisabled' | 'shareDisabled' | 'onLike' | 'onDislike'> {
  postId: string;
  answer: 'like' | 'dislike' | null | undefined;
  correctAnswer: 'like' | 'dislike';
  reasonContent: React.ReactNode;
  reasonHeader: React.ReactNode;
  user: User;
  onLike?: (postId: string) => void;
  onDislike?: (postId: string) => void;
  onCloseModal?: (postId: string) => void;
}

const colors = {
  correctClass: "fill-[--color-dunder-green]",
  incorrectClass: "fill-[--color-dunder-red]",
}

type State = {
  isLiked: boolean;
  isDisliked: boolean;
  showModal: boolean;
};

type Action =
  | { type: 'TOGGLE_LIKE' }
  | { type: 'TOGGLE_DISLIKE' }
  | { type: 'CLOSE_MODAL' };

export const initialState: State = {
  isLiked: false,
  isDisliked: false,
  showModal: false,
};

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'TOGGLE_LIKE':
      return {
        ...state,
        isDisliked: false,
        isLiked: !state.isLiked,
        showModal: true,
      };
    case 'TOGGLE_DISLIKE':
      return {
        ...state,
        isLiked: false,
        isDisliked: !state.isDisliked,
        showModal: true,
      };
    case 'CLOSE_MODAL':
      return {
        ...state,
        showModal: false,
      };
    default:
      return state;
  }
}

export default function LikeDislikePostMessage({
  postId,
  user,
  onLike,
  onDislike,
  onCloseModal,
  answer,
  correctAnswer,
  mediaUrl,
  mediaType,
  content,
  reasonContent,
  reasonHeader,
}: LikeDislikePostMessageProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { showModal } = state;

  const handleLike = () => {
    dispatch({ type: 'TOGGLE_LIKE' });
    onLike?.(postId);
  };

  const handleDislike = () => {
    dispatch({ type: 'TOGGLE_DISLIKE' });
    onDislike?.(postId);
  };

  const handleCloseModal = () => {
    dispatch({ type: 'CLOSE_MODAL' });
    onCloseModal?.(postId);
  };


  const isCorrect = answer === correctAnswer;
  const hasAnswered = answer !== null && answer !== undefined;
  return (
    <>
      <PostMessage
        user={user}
        content={content}
        onLike={handleLike}
        onDislike={handleDislike}
        likeClassName={hasAnswered ? (isCorrect ? colors.correctClass : colors.incorrectClass) : ''}
        dislikeClassName={hasAnswered ? (isCorrect ? colors.correctClass : colors.incorrectClass) : ''}
        likeDisabled={false}
        dislikeDisabled={false}
        commentDisabled={true}
        shareDisabled={true}
        mediaUrl={mediaUrl}
        mediaType={mediaType}
      />
      <PrebunkingModal
        isOpen={showModal}
        onClose={handleCloseModal}
        postId={postId}
        content={reasonContent}
        header={reasonHeader}
      />
    </>
  );
}

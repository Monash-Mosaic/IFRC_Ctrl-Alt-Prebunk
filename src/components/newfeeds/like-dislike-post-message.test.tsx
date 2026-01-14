import React from 'react';
import { render, screen, act } from '@/test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import LikeDislikePostMessage from './like-dislike-post-message';

// Mock PostMessage component
jest.mock('@/app/[locale]/chat/onboarding/_components/post-message', () => {
  return function MockPostMessage({
    name,
    handle,
    content,
    onLike,
    onDislike,
    likeDisabled,
    dislikeDisabled,
    commentDisabled,
    shareDisabled,
    likeClassName,
    dislikeClassName,
  }: any) {
    return (
      <div data-testid="post-message">
        <div data-testid="post-name">{name}</div>
        <div data-testid="post-handle">{handle}</div>
        <div data-testid="post-content">{content}</div>
        <button
          data-testid="like-button"
          onClick={onLike}
          disabled={likeDisabled}
          className={likeClassName}
          aria-label="Like"
        >
          Like
        </button>
        <button
          data-testid="dislike-button"
          onClick={onDislike}
          disabled={dislikeDisabled}
          className={dislikeClassName}
          aria-label="Dislike"
        >
          Dislike
        </button>
        <button
          data-testid="comment-button"
          disabled={commentDisabled}
          aria-label="Comment"
        >
          Comment
        </button>
        <button
          data-testid="share-button"
          disabled={shareDisabled}
          aria-label="Share"
        >
          Share
        </button>
      </div>
    );
  };
});

// Mock PrebunkingModal component
const mockOnClose = jest.fn();
jest.mock('./prebunking-modal', () => {
  return function MockPrebunkingModal({
    isOpen,
    onClose,
    postId,
    content,
    header,
  }: {
    isOpen: boolean;
    onClose: () => void;
    postId: string;
    content: React.ReactNode;
    header: React.ReactNode;
  }) {
    // Store onClose for testing
    if (isOpen) {
      mockOnClose.mockImplementation(onClose);
    }
    return isOpen ? (
      <div data-testid="prebunking-modal">
        <div data-testid="modal-post-id">{postId}</div>
        <button data-testid="modal-close" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null;
  };
});

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}));

// Game store is no longer used in this component


describe('LikeDislikePostMessage', () => {
  const defaultProps = {
    postId: 'post-123',
    user: {
      id: 'echo',
      name: 'Echo',
      handle: '@echo',
      avatar: null,
      isUser: false,
    },
    content: <div>Test post content</div>,
    correctAnswer: 'like' as const,
    answer: null as 'like' | 'dislike' | null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders PostMessage with correct props', () => {
    render(<LikeDislikePostMessage {...defaultProps} />);

    expect(screen.getByTestId('post-message')).toBeInTheDocument();
  });

  it('passes likeDisabled and dislikeDisabled as false when not answered', () => {
    render(<LikeDislikePostMessage {...defaultProps} answer={null} />);

    const likeButton = screen.getByTestId('like-button');
    const dislikeButton = screen.getByTestId('dislike-button');

    expect(likeButton).not.toBeDisabled();
    expect(dislikeButton).not.toBeDisabled();
  });

  it('passes likeDisabled and dislikeDisabled as true when answered', () => {
    render(<LikeDislikePostMessage {...defaultProps} answer="like" />);

    const likeButton = screen.getByTestId('like-button');
    const dislikeButton = screen.getByTestId('dislike-button');

    expect(likeButton).toBeDisabled();
    expect(dislikeButton).toBeDisabled();
  });

  it('passes commentDisabled and shareDisabled as true', () => {
    render(<LikeDislikePostMessage {...defaultProps} />);

    const commentButton = screen.getByTestId('comment-button');
    const shareButton = screen.getByTestId('share-button');

    expect(commentButton).toBeDisabled();
    expect(shareButton).toBeDisabled();
  });

  it('calls onLike when like button is clicked and not answered', async () => {
    const mockOnLike = jest.fn();
    const user = userEvent.setup();
    render(<LikeDislikePostMessage {...defaultProps} answer={null} onLike={mockOnLike} />);

    const likeButton = screen.getByTestId('like-button');
    await user.click(likeButton);

    expect(mockOnLike).toHaveBeenCalledTimes(1);
    expect(mockOnLike).toHaveBeenCalledWith('post-123');
  });

  it('calls onDislike when dislike button is clicked and not answered', async () => {
    const mockOnDislike = jest.fn();
    const user = userEvent.setup();
    render(<LikeDislikePostMessage {...defaultProps} answer={null} onDislike={mockOnDislike} />);

    const dislikeButton = screen.getByTestId('dislike-button');
    await user.click(dislikeButton);

    expect(mockOnDislike).toHaveBeenCalledTimes(1);
    expect(mockOnDislike).toHaveBeenCalledWith('post-123');
  });

  it('does not call onLike if post is already answered', async () => {
    const mockOnLike = jest.fn();
    const user = userEvent.setup();
    render(<LikeDislikePostMessage {...defaultProps} answer="like" onLike={mockOnLike} />);

    const likeButton = screen.getByTestId('like-button');
    await user.click(likeButton);

    expect(mockOnLike).not.toHaveBeenCalled();
  });


  it('applies correct color class to like button when answer is correct', () => {
    render(<LikeDislikePostMessage {...defaultProps} correctAnswer="like" answer="like" />);

    const likeButton = screen.getByTestId('like-button');
    expect(likeButton).toHaveClass('fill-(--color-dunder-green)');
  });

  it('applies incorrect color class to like button when answer is incorrect', () => {
    render(<LikeDislikePostMessage {...defaultProps} correctAnswer="dislike" answer="like" />);

    const likeButton = screen.getByTestId('like-button');
    expect(likeButton).toHaveClass('fill-(--color-dunder-red)');
  });

  it('applies correct color class to dislike button when answer is correct', () => {
    render(<LikeDislikePostMessage {...defaultProps} correctAnswer="dislike" answer="dislike" />);

    const dislikeButton = screen.getByTestId('dislike-button');
    expect(dislikeButton).toHaveClass('fill-(--color-dunder-green)');
  });

  it('applies incorrect color class to dislike button when answer is incorrect', () => {
    render(<LikeDislikePostMessage {...defaultProps} correctAnswer="like" answer="dislike" />);

    const dislikeButton = screen.getByTestId('dislike-button');
    expect(dislikeButton).toHaveClass('fill-(--color-dunder-red)');
  });

  it('does not apply color class to non-clicked button', () => {
    render(<LikeDislikePostMessage {...defaultProps} correctAnswer="like" answer="like" />);

    const dislikeButton = screen.getByTestId('dislike-button');
    expect(dislikeButton).not.toHaveClass('fill-(--color-dunder-green)');
    expect(dislikeButton).not.toHaveClass('fill-(--color-dunder-red)');
  });


  it('works with null answer (not answered yet)', () => {
    render(<LikeDislikePostMessage {...defaultProps} answer={null} />);

    const likeButton = screen.getByTestId('like-button');
    const dislikeButton = screen.getByTestId('dislike-button');

    expect(likeButton).not.toBeDisabled();
    expect(dislikeButton).not.toBeDisabled();
    expect(likeButton).not.toHaveClass('fill-(--color-dunder-green)');
    expect(dislikeButton).not.toHaveClass('fill-(--color-dunder-red)');
  });

});

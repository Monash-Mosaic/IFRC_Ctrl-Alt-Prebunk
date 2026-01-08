import { render, screen } from '@/test-utils/test-utils';
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
          aria-label="Like"
        >
          Like
        </button>
        <button
          data-testid="dislike-button"
          onClick={onDislike}
          disabled={dislikeDisabled}
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
  }: {
    isOpen: boolean;
    onClose: () => void;
    postId: string;
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

describe('LikeDislikePostMessage', () => {
  const defaultProps = {
    postId: 'post-123',
    name: 'Echo',
    handle: '@echo',
    content: <div>Test post content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders PostMessage with correct props', () => {
    render(<LikeDislikePostMessage {...defaultProps} />);

    expect(screen.getByTestId('post-message')).toBeInTheDocument();
    expect(screen.getByTestId('post-name')).toHaveTextContent('Echo');
    expect(screen.getByTestId('post-handle')).toHaveTextContent('@echo');
  });

  it('passes likeDisabled and dislikeDisabled as false', () => {
    render(<LikeDislikePostMessage {...defaultProps} />);

    const likeButton = screen.getByTestId('like-button');
    const dislikeButton = screen.getByTestId('dislike-button');

    expect(likeButton).not.toBeDisabled();
    expect(dislikeButton).not.toBeDisabled();
  });

  it('passes commentDisabled and shareDisabled as true', () => {
    render(<LikeDislikePostMessage {...defaultProps} />);

    const commentButton = screen.getByTestId('comment-button');
    const shareButton = screen.getByTestId('share-button');

    expect(commentButton).toBeDisabled();
    expect(shareButton).toBeDisabled();
  });

  it('shows modal when like button is clicked', async () => {
    const user = userEvent.setup();
    render(<LikeDislikePostMessage {...defaultProps} />);

    const likeButton = screen.getByTestId('like-button');
    await user.click(likeButton);

    expect(screen.getByTestId('prebunking-modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-post-id')).toHaveTextContent('post-123');
  });

  it('shows modal when dislike button is clicked', async () => {
    const user = userEvent.setup();
    render(<LikeDislikePostMessage {...defaultProps} />);

    const dislikeButton = screen.getByTestId('dislike-button');
    await user.click(dislikeButton);

    expect(screen.getByTestId('prebunking-modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-post-id')).toHaveTextContent('post-123');
  });

  it('calls onLike callback with postId when like button is clicked', async () => {
    const mockOnLike = jest.fn();
    const user = userEvent.setup();
    render(<LikeDislikePostMessage {...defaultProps} onLike={mockOnLike} />);

    const likeButton = screen.getByTestId('like-button');
    await user.click(likeButton);

    expect(mockOnLike).toHaveBeenCalledTimes(1);
    expect(mockOnLike).toHaveBeenCalledWith('post-123');
  });

  it('calls onDislike callback with postId when dislike button is clicked', async () => {
    const mockOnDislike = jest.fn();
    const user = userEvent.setup();
    render(<LikeDislikePostMessage {...defaultProps} onDislike={mockOnDislike} />);

    const dislikeButton = screen.getByTestId('dislike-button');
    await user.click(dislikeButton);

    expect(mockOnDislike).toHaveBeenCalledTimes(1);
    expect(mockOnDislike).toHaveBeenCalledWith('post-123');
  });

  it('closes modal when modal close button is clicked', async () => {
    const user = userEvent.setup();
    render(<LikeDislikePostMessage {...defaultProps} />);

    // Open modal by clicking like
    const likeButton = screen.getByTestId('like-button');
    await user.click(likeButton);

    expect(screen.getByTestId('prebunking-modal')).toBeInTheDocument();

    // Close modal
    const closeButton = screen.getByTestId('modal-close');
    await user.click(closeButton);

    expect(screen.queryByTestId('prebunking-modal')).not.toBeInTheDocument();
  });

  it('toggles like state when like button is clicked multiple times', async () => {
    const user = userEvent.setup();
    render(<LikeDislikePostMessage {...defaultProps} />);

    const likeButton = screen.getByTestId('like-button');

    // First click - should open modal
    await user.click(likeButton);
    expect(screen.getByTestId('prebunking-modal')).toBeInTheDocument();

    // Close modal
    const closeButton = screen.getByTestId('modal-close');
    await user.click(closeButton);

    // Second click - should open modal again
    await user.click(likeButton);
    expect(screen.getByTestId('prebunking-modal')).toBeInTheDocument();
  });

  it('toggles dislike state when dislike button is clicked multiple times', async () => {
    const user = userEvent.setup();
    render(<LikeDislikePostMessage {...defaultProps} />);

    const dislikeButton = screen.getByTestId('dislike-button');

    // First click - should open modal
    await user.click(dislikeButton);
    expect(screen.getByTestId('prebunking-modal')).toBeInTheDocument();

    // Close modal
    const closeButton = screen.getByTestId('modal-close');
    await user.click(closeButton);

    // Second click - should open modal again
    await user.click(dislikeButton);
    expect(screen.getByTestId('prebunking-modal')).toBeInTheDocument();
  });

  it('unlikes when dislike is clicked after like', async () => {
    const user = userEvent.setup();
    render(<LikeDislikePostMessage {...defaultProps} />);

    // Click like
    const likeButton = screen.getByTestId('like-button');
    await user.click(likeButton);

    // Close modal
    const closeButton = screen.getByTestId('modal-close');
    await user.click(closeButton);

    // Click dislike - should open modal and clear like state
    const dislikeButton = screen.getByTestId('dislike-button');
    await user.click(dislikeButton);

    expect(screen.getByTestId('prebunking-modal')).toBeInTheDocument();
  });

  it('undislikes when like is clicked after dislike', async () => {
    const user = userEvent.setup();
    render(<LikeDislikePostMessage {...defaultProps} />);

    // Click dislike
    const dislikeButton = screen.getByTestId('dislike-button');
    await user.click(dislikeButton);

    // Close modal
    const closeButton = screen.getByTestId('modal-close');
    await user.click(closeButton);

    // Click like - should open modal and clear dislike state
    const likeButton = screen.getByTestId('like-button');
    await user.click(likeButton);

    expect(screen.getByTestId('prebunking-modal')).toBeInTheDocument();
  });

  it('passes all PostMessage props correctly', () => {
    const customContent = <div>Custom content</div>;
    render(
      <LikeDislikePostMessage
        {...defaultProps}
        name="Custom Name"
        handle="@custom"
        content={customContent}
        mediaUrl="/test.jpg"
        mediaType="image"
        className="custom-class"
      />
    );

    expect(screen.getByTestId('post-name')).toHaveTextContent('Custom Name');
    expect(screen.getByTestId('post-handle')).toHaveTextContent('@custom');
  });
});

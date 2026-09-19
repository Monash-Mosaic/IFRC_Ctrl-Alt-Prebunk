/**
 * Tests for HomeContent navigation (handleNext / handlePrevious / toast dismiss).
 * These tests use the real GameFeed (native snap feed); its scroll animation is
 * collapsed into a single frame because jsdom has no layout.
 */
import React from 'react';
import { render, screen, act, fireEvent } from '@/test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import HomeContent from '@/components/home-content';
import { useCredibilityStore } from '@/lib/use-credibility-store';

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
  useLocale: jest.fn(() => 'en'),
}));

const mockSetOnboardingCompleted = jest.fn();
jest.mock('@/lib/use-local-storage', () => ({
  useLocalStorage: jest.fn(() => [true, mockSetOnboardingCompleted]),
}));

const mockGetAnswer = jest.fn((_postId: string): string | null => null);
const mockSetAnswer = jest.fn();
const mockIsAnswered = jest.fn((_postId: string) => false);
const mockMoveToNextQuestion = jest.fn();
const mockIsPostDisabled = jest.fn(() => false);
const mockIsGameCompleted = jest.fn(() => false);
const mockGetCorrectAnswers = jest.fn(() => 0);
const mockIncrCorrectAnswers = jest.fn();
const mockGetNumQuestions = jest.fn(() => 2);
const mockResetGame = jest.fn();

const mockUseGameStore = jest.fn(() => ({
  getAnswer: mockGetAnswer,
  setAnswer: mockSetAnswer,
  isAnswered: mockIsAnswered,
  moveToNextQuestion: mockMoveToNextQuestion,
  isPostDisabled: mockIsPostDisabled,
  isGameCompleted: mockIsGameCompleted,
  getCorrectAnswers: mockGetCorrectAnswers,
  incrCorrectAnswers: mockIncrCorrectAnswers,
  getNumQuestions: mockGetNumQuestions,
  resetGame: mockResetGame,
}));

jest.mock('@/lib/use-game-store', () => ({
  createGameStore: jest.fn(() => mockUseGameStore),
}));

jest.mock('@/lib/use-credibility-store');

jest.mock('@/contents', () => ({
  __esModule: true,
  default: {
    en: {
      content: {
        '1': {
          id: '1',
          type: 'like_dislike',
          post: {
            id: '1',
            user: { id: 'echo', name: 'Echo', handle: '@echo', avatar: null, isUser: false },
            content: <div>Post 1</div>,
            mediaUrl: '',
            mediaType: 'image' as const,
          },
          correctAnswer: 'like' as const,
          whyCorrectAnswer: { title: <div>Correct</div>, content: <div>Because</div> },
          whyIncorrectAnswer: { title: <div>Incorrect</div>, content: <div>Try again</div> },
        },
        '2': {
          id: '2',
          type: 'like_dislike',
          post: {
            id: '2',
            user: { id: 'echo', name: 'Echo', handle: '@echo', avatar: null, isUser: false },
            content: <div>Post 2</div>,
            mediaUrl: '',
            mediaType: 'image' as const,
          },
          correctAnswer: 'dislike' as const,
          whyCorrectAnswer: { title: <div>Correct</div>, content: <div>Because</div> },
          whyIncorrectAnswer: { title: <div>Incorrect</div>, content: <div>Try again</div> },
        },
      },
      contentList: [
        {
          id: '1',
          type: 'like_dislike',
          post: {
            id: '1',
            user: { id: 'echo', name: 'Echo', handle: '@echo', avatar: null, isUser: false },
            content: <div>Post 1</div>,
            mediaUrl: '',
            mediaType: 'image' as const,
          },
          correctAnswer: 'like' as const,
          whyCorrectAnswer: { title: <div>Correct</div>, content: <div>Because</div> },
          whyIncorrectAnswer: { title: <div>Incorrect</div>, content: <div>Try again</div> },
        },
        {
          id: '2',
          type: 'like_dislike',
          post: {
            id: '2',
            user: { id: 'echo', name: 'Echo', handle: '@echo', avatar: null, isUser: false },
            content: <div>Post 2</div>,
            mediaUrl: '',
            mediaType: 'image' as const,
          },
          correctAnswer: 'dislike' as const,
          whyCorrectAnswer: { title: <div>Correct</div>, content: <div>Because</div> },
          whyIncorrectAnswer: { title: <div>Incorrect</div>, content: <div>Try again</div> },
        },
      ],
    },
  },
}));

jest.mock('@/components/newfeeds/like-dislike-post-message', () => {
  return function MockLikeDislikePostMessage({ postId, onLike, onDislike }: any) {
    return (
      <div data-testid={`post-${postId}`}>
        <button data-testid={`like-${postId}`} onClick={() => onLike?.(postId)}>
          Like
        </button>
        <button data-testid={`dislike-${postId}`} onClick={() => onDislike?.(postId)}>
          Dislike
        </button>
        <button data-testid={`like-unknown-${postId}`} onClick={() => onLike?.('not-in-feed')}>
          Like unknown
        </button>
      </div>
    );
  };
});

jest.mock('@/components/newfeeds/prebunking-modal', () => {
  return function MockPrebunkingModal({ isOpen, onClose, onContinue, postId }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid={`modal-${postId}`}>
        <button data-testid={`close-modal-${postId}`} onClick={onClose}>
          Close
        </button>
        <button data-testid={`continue-modal-${postId}`} onClick={onContinue}>
          Continue
        </button>
      </div>
    );
  };
});

jest.mock('@/components/chat-content', () => () => <div data-testid="chat-content" />);
jest.mock('@/components/game-complete', () => () => <div data-testid="game-complete" />);

// The real GameFeed is used: posts are moved between with swipes, and the feed
// exposes the post on screen through its data-active-index attribute.

/** Index of the post currently on screen. */
function snappedPostIndex(): number {
  return Number(screen.getByRole('feed').getAttribute('data-active-index'));
}

function swipe(direction: 'up' | 'down') {
  const feed = screen.getByRole('feed');
  const [from, to] = direction === 'up' ? [500, 300] : [300, 500];
  fireEvent.touchStart(feed, { touches: [{ clientX: 100, clientY: from }] });
  fireEvent.touchEnd(feed, { changedTouches: [{ clientX: 100, clientY: to }] });
}

/** Swipe until the post at `index` is on screen. */
function setActivePost(index: number) {
  for (let guard = 0; guard < 10 && snappedPostIndex() !== index; guard += 1) {
    swipe(snappedPostIndex() < index ? 'up' : 'down');
  }
  expect(snappedPostIndex()).toBe(index);
}

describe('HomeContent navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAnswer.mockReturnValue(null);
    mockIsAnswered.mockReturnValue(false);
    mockIsPostDisabled.mockReturnValue(false);
    mockIsGameCompleted.mockReturnValue(false);

    (useCredibilityStore as unknown as jest.Mock).mockReturnValue({
      points: 0,
      credibility: 1,
      initialCredibility: 1,
      addPoints: jest.fn(),
      increaseCredibility: jest.fn(),
      decreaseCredibility: jest.fn(),
      initCredibility: jest.fn(),
      recordLinkClick: jest.fn(),
      resetCredibility: jest.fn(),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders only the answered posts plus the current unanswered one', () => {
    render(<HomeContent />);
    expect(screen.getByTestId('post-1')).toBeInTheDocument();
    expect(screen.queryByTestId('post-2')).not.toBeInTheDocument();
    expect(screen.getByText('lockedHint')).toBeInTheDocument();
  });

  it('unlocks the next post once the current one is answered', () => {
    mockIsAnswered.mockImplementation((id: string) => id === '1');
    render(<HomeContent />);
    expect(screen.getByTestId('post-1')).toBeInTheDocument();
    expect(screen.getByTestId('post-2')).toBeInTheDocument();
  });

  it('hides the locked hint when every unlocked post is answered', () => {
    mockIsAnswered.mockReturnValue(true);
    render(<HomeContent />);
    expect(screen.queryByText('lockedHint')).not.toBeInTheDocument();
  });

  it('shows a toast when next is clicked but the current post is not engaged', async () => {
    const user = userEvent.setup();
    render(<HomeContent />);

    await user.click(screen.getByRole('button', { name: 'Next post' }));

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('answerToContinue')).toBeInTheDocument();
    expect(snappedPostIndex()).toBe(0);
    expect(mockMoveToNextQuestion).not.toHaveBeenCalled();
  });

  it('keeps one set of traversal controls hidden below the desktop breakpoint', () => {
    render(<HomeContent />);
    const previous = screen.getByRole('button', { name: 'Previous post' });
    const next = screen.getByRole('button', { name: 'Next post' });
    expect(previous.parentElement).toBe(next.parentElement);
    expect(next.parentElement).toHaveClass('hidden', 'md:flex', 'shrink-0', 'flex-col');
    expect(previous).toHaveAttribute('aria-disabled', 'true');
    expect(next).toHaveAttribute('aria-disabled', 'true');
  });

  it('preserves desktop traversal without advancing game state', async () => {
    mockIsAnswered.mockReturnValue(true);
    const user = userEvent.setup();
    render(<HomeContent />);
    setActivePost(1);
    await user.click(screen.getByRole('button', { name: 'Previous post' }));
    expect(snappedPostIndex()).toBe(0);
    expect(mockMoveToNextQuestion).not.toHaveBeenCalled();
  });

  it('shows a toast when next is clicked on the last post', async () => {
    mockIsAnswered.mockReturnValue(true);
    const user = userEvent.setup();
    render(<HomeContent />);
    setActivePost(1);

    await user.click(screen.getByRole('button', { name: 'Next post' }));

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('alreadyLast')).toBeInTheDocument();
    expect(snappedPostIndex()).toBe(1);
  });

  it('scrolls to next post when next is clicked after engaging', async () => {
    mockIsAnswered.mockImplementation((id: string) => id === '1');
    const user = userEvent.setup();
    render(<HomeContent />);
    // Returning players open on their current question; go back to the answered one first.
    setActivePost(0);

    await user.click(screen.getByRole('button', { name: 'Next post' }));

    expect(snappedPostIndex()).toBe(1);
    expect(mockMoveToNextQuestion).not.toHaveBeenCalled();
  });

  it('shows a toast when previous is clicked on the first post', async () => {
    const user = userEvent.setup();
    render(<HomeContent />);

    await user.click(screen.getByRole('button', { name: 'Previous post' }));

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('alreadyFirst')).toBeInTheDocument();
  });

  it('scrolls to previous post when previous is clicked on a non-first post', async () => {
    mockIsAnswered.mockReturnValue(true);
    const user = userEvent.setup();
    render(<HomeContent />);
    setActivePost(1);

    await user.click(screen.getByRole('button', { name: 'Previous post' }));

    expect(snappedPostIndex()).toBe(0);
  });

  it('scrolls to the newly unlocked post when continue is pressed in the modal', async () => {
    const user = userEvent.setup();
    mockGetAnswer.mockImplementation((id: string) => (id === '1' ? 'like' : null));
    const { rerender } = render(<HomeContent />);

    await user.click(screen.getByTestId('like-1'));
    expect(screen.getByTestId('modal-1')).toBeInTheDocument();

    // The store now reports post 1 as answered, so post 2 is unlocked.
    mockIsAnswered.mockImplementation((id: string) => id === '1');
    rerender(<HomeContent />);
    expect(screen.getByTestId('post-2')).toBeInTheDocument();

    await user.click(screen.getByTestId('continue-modal-1'));
    expect(mockMoveToNextQuestion).toHaveBeenCalledTimes(1);
    expect(snappedPostIndex()).toBe(1);
  });

  it('shows a toast when the user wheels past a locked post', () => {
    render(<HomeContent />);

    fireEvent.wheel(screen.getByRole('feed'), { deltaY: 100 });

    expect(screen.getByRole('alert')).toHaveTextContent('blockedScroll');
    expect(snappedPostIndex()).toBe(0);
  });

  it('shows a toast when the user swipes past a locked post', () => {
    render(<HomeContent />);

    swipe('up');

    expect(screen.getByRole('alert')).toHaveTextContent('blockedScroll');
    expect(snappedPostIndex()).toBe(0);
  });

  it('keeps swiping working after the blocked toast is tapped', async () => {
    // Regression: on iOS, tapping the blocked toast used to leave the feed
    // unresponsive to swipes for a while.
    mockIsAnswered.mockImplementation((id: string) => id === '1');
    const user = userEvent.setup();
    render(<HomeContent />);
    setActivePost(1);

    swipe('up');
    await user.click(screen.getByRole('alert'));
    await user.click(screen.getByRole('button', { name: 'Close notification' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    swipe('down');
    expect(snappedPostIndex()).toBe(0);
    swipe('up');
    expect(snappedPostIndex()).toBe(1);
  });

  it('opens a returning player on their current question', () => {
    mockIsAnswered.mockImplementation((id: string) => id === '1');
    render(<HomeContent />);
    expect(snappedPostIndex()).toBe(1);
  });

  it('ignores an answer for a post that is not in the content list', async () => {
    const user = userEvent.setup();
    const { addPoints, decreaseCredibility } = (useCredibilityStore as unknown as jest.Mock)();
    render(<HomeContent />);

    await user.click(screen.getByTestId('like-unknown-1'));

    expect(addPoints).not.toHaveBeenCalled();
    expect(decreaseCredibility).not.toHaveBeenCalled();
    expect(screen.queryByTestId('modal-not-in-feed')).not.toBeInTheDocument();
  });

  it('dismisses the toast when its close button is clicked', async () => {
    const user = userEvent.setup();
    render(<HomeContent />);

    await user.click(screen.getByRole('button', { name: 'Next post' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close notification' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

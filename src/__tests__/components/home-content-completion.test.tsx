/**
 * Integration test using the REAL use-game-store (not mocked), to catch bugs
 * that only manifest from the actual store lifecycle across re-renders.
 */
import React from 'react';
import { act, render, renderHook, screen } from '@/test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import HomeContent from '@/components/home-content';
import PointsCredibilityBar from '@/components/points-credibility-bar';
import { defaultAlexChatState, type AlexChatState, STORAGE_KEYS, storage } from '@/lib/local-storage';
import { useAlexChat } from '@/lib/use-alex-chat';

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
  useLocale: jest.fn(() => 'en'),
}));

const mockSetOnboardingCompleted = jest.fn();
jest.mock('@/lib/use-local-storage', () => ({
  useLocalStorage: jest.fn(() => [true, mockSetOnboardingCompleted]),
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

const mockPostRendered = jest.fn();
jest.mock('@/components/newfeeds/like-dislike-post-message', () => {
  return function MockLikeDislikePostMessage({ postId, onLike, onDislike }: any) {
    mockPostRendered(postId);
    return (
      <div data-testid={`post-${postId}`}>
        <button data-testid={`like-${postId}`} onClick={() => onLike?.(postId)}>
          Like
        </button>
        <button data-testid={`dislike-${postId}`} onClick={() => onDislike?.(postId)}>
          Dislike
        </button>
      </div>
    );
  };
});

jest.mock('@/components/newfeeds/prebunking-modal', () => {
  return function MockPrebunkingModal({ isOpen, onContinue, onClose, postId }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid={`modal-${postId}`}>
        <button
          data-testid={`continue-modal-${postId}`}
          onClick={() => {
            onContinue?.();
            onClose?.();
          }}
        >
          Continue
        </button>
      </div>
    );
  };
});

jest.mock('@/components/chat-content', () => () => <div data-testid="chat-content" />);
jest.mock('@/components/game-complete', () => {
  return function MockGameComplete({ correctAnswers, totalQuestions }: any) {
    return (
      <div data-testid="game-complete">
        <span data-testid="game-score">
          {correctAnswers}/{totalQuestions}
        </span>
      </div>
    );
  };
});

function setAlex(next: AlexChatState) {
  const hook = renderHook(() => useAlexChat());
  act(() => {
    hook.result.current[1](next);
  });
  hook.unmount();
}

describe('HomeContent game completion (real game store)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    setAlex(defaultAlexChatState);

    (require('@/lib/use-credibility-store').useCredibilityStore as jest.Mock).mockReturnValue({
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

  async function answerFeed() {
    const user = userEvent.setup();
    await user.click(screen.getByTestId('like-1'));
    await user.click(await screen.findByTestId('continue-modal-1'));
    await user.click(screen.getByTestId('dislike-2'));
    expect(screen.queryByTestId('game-complete')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'viewResults' })).not.toBeInTheDocument();
    await user.click(await screen.findByTestId('continue-modal-2'));
  }

  function renderGame() {
    return render(
      <>
        <PointsCredibilityBar />
        <HomeContent />
      </>
    );
  }

  it('lets the player view feed-only results and clears the pending Alex message', async () => {
    setAlex({ notified: true, reply: null });
    renderGame();
    expect(screen.getByText('score: 0/2')).toBeInTheDocument();

    await answerFeed();
    expect(screen.queryByTestId('game-complete')).not.toBeInTheDocument();
    expect(screen.getByRole('feed')).toBeInTheDocument();
    const completionActions = screen.getByRole('region', { name: 'feedComplete' });
    expect(completionActions.previousElementSibling).toBe(screen.getByTestId('post-2'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'openAlexMessage' })).toHaveAttribute(
      'href',
      '/chat/alex'
    );
    expect(screen.getByText('score: 2/2')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'viewResults' }));
    expect(await screen.findByTestId('game-complete')).toBeInTheDocument();
    expect(screen.getByTestId('game-score')).toHaveTextContent('2/2');
    expect(storage.getItem(STORAGE_KEYS.ALEX_CHAT)).toEqual(defaultAlexChatState);
  });

  it.each([
    ['right', '3/3'],
    ['wrong', '2/3'],
  ] as const)('shows results without rendering the feed on return from a %s Alex reply', async (reply, score) => {
    const { unmount } = renderGame();
    await answerFeed();
    await userEvent.click(screen.getByRole('link', { name: 'openAlexMessage' }));
    expect(storage.getItem(STORAGE_KEYS.ALEX_CHAT)).toEqual({ notified: true, reply: null });
    unmount();
    setAlex({ notified: true, reply });
    mockPostRendered.mockClear();
    renderGame();

    expect(screen.getByTestId('game-complete')).toBeInTheDocument();
    expect(mockPostRendered).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'viewResults' })).not.toBeInTheDocument();
    expect(screen.getByText('score: ' + score)).toBeInTheDocument();
    expect(screen.getByTestId('game-score')).toHaveTextContent(score);
  });

  it('restores the choice after refreshing a session left at the end of the feed', async () => {
    setAlex({ notified: true, reply: null });
    const { unmount } = renderGame();
    await answerFeed();
    unmount();
    renderGame();

    expect(screen.getByRole('link', { name: 'openAlexMessage' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'viewResults' }));
    expect(screen.getByTestId('game-score')).toHaveTextContent('2/2');
  });

  it('shows results automatically after the final feed feedback when Alex was already answered', async () => {
    setAlex({ notified: true, reply: 'wrong' });
    renderGame();
    await answerFeed();

    expect(await screen.findByTestId('game-complete')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'feedComplete' })).not.toBeInTheDocument();
    expect(screen.getByTestId('game-score')).toHaveTextContent('2/3');
  });
});

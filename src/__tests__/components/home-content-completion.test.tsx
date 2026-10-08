/**
 * Integration test using the REAL use-game-store (not mocked), to catch bugs
 * that only manifest from the actual store lifecycle across re-renders.
 */
import React from 'react';
import { act, render, renderHook, screen } from '@/test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import HomeContent from '@/components/home-content';
import { defaultAlexChatState, type AlexChatState } from '@/lib/local-storage';
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
    await user.click(await screen.findByTestId('continue-modal-2'));
  }

  it('stays on the feed when every post is answered and Alex has no reply', async () => {
    render(<HomeContent />);
    await answerFeed();
    expect(screen.queryByTestId('game-complete')).not.toBeInTheDocument();
  });

  it('ends on the right Alex reply and counts it in the score', async () => {
    render(<HomeContent />);
    await answerFeed();

    setAlex({ notified: true, reply: 'right', remind: 1 });

    expect(await screen.findByTestId('game-complete')).toBeInTheDocument();
    expect(screen.getByTestId('game-score')).toHaveTextContent('3/3');
  });

  it('ends on a wrong Alex reply without giving that point', async () => {
    render(<HomeContent />);
    await answerFeed();

    setAlex({ notified: true, reply: 'wrong', remind: 1 });

    expect(await screen.findByTestId('game-complete')).toBeInTheDocument();
    expect(screen.getByTestId('game-score')).toHaveTextContent('2/3');
  });

  it('ends immediately on the last post when Alex was already answered', async () => {
    setAlex({ notified: true, reply: 'wrong', remind: 0 });
    render(<HomeContent />);
    await answerFeed();

    expect(await screen.findByTestId('game-complete')).toBeInTheDocument();
    expect(screen.getByTestId('game-score')).toHaveTextContent('2/3');
  });
});

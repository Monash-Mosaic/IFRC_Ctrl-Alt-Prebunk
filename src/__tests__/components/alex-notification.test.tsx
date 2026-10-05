import React from 'react';
import { act, fireEvent, render, renderHook, screen } from '@/test-utils/test-utils';
import HomeContent from '@/components/home-content';
import Navigation from '@/components/navigation-bar';
import ChatPage from '@/app/[locale]/chat/page';
import { defaultAlexChatState, type AlexChatState } from '@/lib/local-storage';
import { useAlexChat } from '@/lib/use-alex-chat';

const answers: Record<string, string> = {};

jest.mock('next-intl', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const en = require('@/messages/en.json');
  const translate = (namespace?: string) => {
    const table = namespace
      ? namespace.split('.').reduce((node: Record<string, unknown> | undefined, part: string) => {
          const next = node?.[part];
          return next && typeof next === 'object' ? (next as Record<string, unknown>) : undefined;
        }, en)
      : en;
    return (key: string) => (typeof table?.[key] === 'string' ? table[key] : key);
  };
  return {
    useTranslations: (namespace?: string) => translate(namespace),
    useLocale: () => 'en',
  };
});

jest.mock('@/lib/use-local-storage', () => ({
  useLocalStorage: jest.fn(() => [true, jest.fn()]),
}));

jest.mock('@/lib/use-game-store', () => ({
  createGameStore: jest.fn(() => () => ({
    getAnswer: (id: string) => answers[id] ?? null,
    setAnswer: (id: string, answer: string) => {
      answers[id] = answer;
    },
    isAnswered: (id: string) => answers[id] != null,
    moveToNextQuestion: jest.fn(),
    isPostDisabled: () => false,
    isGameCompleted: () => false,
    getCorrectAnswers: () => 0,
    incrCorrectAnswers: jest.fn(),
    getNumQuestions: () => 2,
    resetGame: jest.fn(),
  })),
}));

function post(id: string) {
  return {
    id,
    type: 'like_dislike',
    post: {
      id,
      user: { id: 'echo', name: 'Echo', handle: '@echo', avatar: null, isUser: false },
      content: <div>{id}</div>,
      mediaUrl: '',
      mediaType: 'image' as const,
    },
    correctAnswer: 'dislike' as const,
    whyCorrectAnswer: { title: <div>Correct</div>, content: <div>Because</div> },
    whyIncorrectAnswer: { title: <div>Incorrect</div>, content: <div>Try again</div> },
  };
}

jest.mock('@/contents', () => ({
  __esModule: true,
  default: {
    en: {
      content: {},
      contentList: [post('other'), post('like-dislike-7')],
    },
  },
}));

jest.mock('@/components/newfeeds/like-dislike-post-message', () => {
  return function MockPost({
    postId,
    onDislike,
  }: {
    postId: string;
    onDislike?: (id: string) => void;
  }) {
    return (
      <button type="button" onClick={() => onDislike?.(postId)}>
        report-{postId}
      </button>
    );
  };
});

jest.mock('@/components/newfeeds/prebunking-modal', () => {
  return function MockModal({
    isOpen,
    onContinue,
    onClose,
    postId,
  }: {
    isOpen: boolean;
    onContinue?: () => void;
    onClose: () => void;
    postId: string;
  }) {
    if (!isOpen) return null;
    return (
      <button
        type="button"
        onClick={() => {
          onContinue?.();
          onClose();
        }}
      >
        continue-{postId}
      </button>
    );
  };
});

jest.mock('@/components/chat-content', () => () => <div data-testid="chat-content" />);
jest.mock('@/components/game-complete', () => () => <div data-testid="game-complete" />);

function setAlex(next: AlexChatState) {
  const hook = renderHook(() => useAlexChat());
  act(() => {
    hook.result.current[1](next);
  });
  hook.unmount();
}

function noticeLinks() {
  return screen.queryAllByRole('link', { name: 'Alex sent you a message' });
}

function dismissPost(id: string) {
  fireEvent.click(screen.getByRole('button', { name: `report-${id}` }));
  fireEvent.click(screen.getByRole('button', { name: `continue-${id}` }));
}

describe('Alex notification', () => {
  beforeEach(() => {
    for (const id of Object.keys(answers)) delete answers[id];
    localStorage.clear();
    (global as unknown as { mockUsePathname: jest.Mock }).mockUsePathname.mockReturnValue('/');
    setAlex(defaultAlexChatState);
  });

  it('stays hidden until the third quiz post is dismissed, then does not fire again', () => {
    render(
      <>
        <Navigation />
        <HomeContent />
      </>
    );

    expect(noticeLinks()).toHaveLength(0);

    dismissPost('other');
    expect(noticeLinks()).toHaveLength(0);

    dismissPost('like-dislike-7');
    expect(noticeLinks()).toHaveLength(2);
  });

  it('does not send the notification again once Alex has already written', () => {
    setAlex({ notified: true, reply: null });
    answers.other = 'dislike';
    render(
      <>
        <Navigation />
        <HomeContent />
      </>
    );

    expect(noticeLinks()).toHaveLength(2);

    const setItem = jest.spyOn(Storage.prototype, 'setItem');
    setItem.mockClear();
    dismissPost('like-dislike-7');
    expect(setItem.mock.calls.filter((call) => call[0] === 'alex_chat')).toHaveLength(0);
    expect(noticeLinks()).toHaveLength(2);
    setItem.mockRestore();
  });

  it('does not show the callout on the chat pages or after a reply', () => {
    setAlex({ notified: true, reply: null });
    (global as unknown as { mockUsePathname: jest.Mock }).mockUsePathname.mockReturnValue('/chat');
    const { unmount } = render(<Navigation />);
    expect(noticeLinks()).toHaveLength(0);
    unmount();

    (global as unknown as { mockUsePathname: jest.Mock }).mockUsePathname.mockReturnValue('/');
    setAlex({ notified: true, reply: 'wrong' });
    render(<Navigation />);
    expect(noticeLinks()).toHaveLength(0);
  });

  it('uses the whole notice box as the link and keeps close outside it', () => {
    setAlex({ notified: true, reply: null });
    render(<Navigation />);

    const links = noticeLinks();
    expect(links).toHaveLength(2);
    for (const link of links) {
      expect(link).toHaveAttribute('href', '/chat/alex');
      expect(link).toHaveClass('border-2');
      expect(link.querySelector('button')).toBeNull();
    }

    fireEvent.click(screen.getAllByRole('button', { name: 'Close notification' })[0]);
    expect(noticeLinks()).toHaveLength(0);
  });

  it('keeps Alex coming soon until the notification exists', () => {
    const { unmount } = render(<ChatPage />);
    const locked = screen.getByRole('link', { name: /Alex/ });
    expect(locked).toHaveTextContent('Coming Soon');
    expect(locked).toHaveClass('cursor-not-allowed');

    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    locked.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    unmount();

    setAlex({ notified: true, reply: null });
    render(<ChatPage />);
    const open = screen.getByRole('link', { name: /Alex/ });
    expect(open).toHaveTextContent('New message');
    expect(open).not.toHaveClass('cursor-not-allowed');
    expect(open).toHaveAttribute('href', '/chat/alex');
  });
});

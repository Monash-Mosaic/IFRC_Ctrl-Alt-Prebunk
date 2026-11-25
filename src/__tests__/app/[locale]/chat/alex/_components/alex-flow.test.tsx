import React from 'react';
import { act, fireEvent, render, renderHook, screen } from '@/test-utils/test-utils';
import { useTranslations } from 'next-intl';
import en from '@/messages/en.json';
import { contentList } from '@/contents/en';
import AlexFlow from '@/app/[locale]/chat/alex/_components/alex-flow';
import { defaultAlexChatState, type AlexChatState, storage, STORAGE_KEYS } from '@/lib/local-storage';
import { useAlexChat } from '@/lib/use-alex-chat';
import { useCredibilityStore } from '@/lib/use-credibility-store';

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
  useLocale: () => 'en',
}));

jest.mock('react-modal', () => {
  function Modal({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) {
    if (!isOpen) return null;
    return <div role="dialog">{children}</div>;
  }
  Modal.setAppElement = jest.fn();
  return Modal;
});

function translate(namespace?: string) {
  const table = namespace
    ? namespace.split('.').reduce<unknown>((node, part) => {
        if (node && typeof node === 'object' && part in node) {
          return (node as Record<string, unknown>)[part];
        }
        return undefined;
      }, en)
    : en;
  return (key: string) => {
    if (table && typeof table === 'object' && key in table) {
      const value = (table as Record<string, unknown>)[key];
      return typeof value === 'string' ? value : key;
    }
    return key;
  };
}

const router = { push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() };

function setAlex(next: AlexChatState) {
  const hook = renderHook(() => useAlexChat());
  act(() => {
    hook.result.current[1](next);
  });
  hook.unmount();
}

function showReplyButtons() {
  render(<AlexFlow />);
  act(() => {
    jest.advanceTimersByTime(4800);
  });
}

function completeFeed() {
  storage.setItem(STORAGE_KEYS.GAME_STATE, {
    state: { answers: Object.fromEntries(contentList.map(({ id }) => [id, 'attempted'])) },
    version: 0,
  });
}

describe('AlexFlow', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
    router.replace.mockClear();
    (global as unknown as { mockUseRouter: jest.Mock }).mockUseRouter.mockReturnValue(router);
    (useTranslations as jest.Mock).mockImplementation((namespace?: string) => translate(namespace));
    setAlex({ ...defaultAlexChatState, notified: true });
    useCredibilityStore.setState({
      points: 0,
      credibility: 5,
      initialCredibility: 10,
      clickedLinks: [],
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    (useTranslations as jest.Mock).mockImplementation(() => (key: string) => key);
  });

  it('shows Excellent catch and adds points for the right reply', () => {
    showReplyButtons();

    expect(screen.getByText('Here it is: https://q7m4x9.invalid')).toBeInTheDocument();
    expect(useCredibilityStore.getState().points).toBe(0);

    fireEvent.click(screen.getByRole('button', { name: /Wait, Alex. The article claims/ }));
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText('Excellent catch!')).toBeInTheDocument();
    expect(screen.getByText(/look for independent reporting or official records/)).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(useCredibilityStore.getState().points).toBe(5);
    expect(useCredibilityStore.getState().credibility).toBe(6);
    expect(screen.getAllByLabelText('Reaction')).toHaveLength(1);
    expect(screen.getAllByText(/\d{1,2}:\d{2}(AM|PM)/)).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Back to the feed' })).toBeInTheDocument();
  });

  it('shows the Not quite popup for the wrong reply and does not add points', () => {
    showReplyButtons();

    fireEvent.click(screen.getByRole('button', { name: /That's huge if it's true/ }));

    const popup = screen.getByRole('dialog');
    expect(popup).toHaveTextContent('Not quite');
    expect(popup).toHaveTextContent('Sharing the article would spread an unverified claim.');
    expect(screen.queryByText('Excellent catch!')).not.toBeInTheDocument();
    expect(useCredibilityStore.getState().points).toBe(0);
    expect(useCredibilityStore.getState().credibility).toBe(4);
    expect(screen.getAllByLabelText('Reaction')).toHaveLength(1);
    expect(screen.getAllByText(/\d{1,2}:\d{2}(AM|PM)/)).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: 'Got it! Continue' }));
    expect(screen.getAllByText(/\d{1,2}:\d{2}(AM|PM)/)).toHaveLength(1);
    expect(router.replace).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back to the feed' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Back to the feed' }));
    expect(router.replace).toHaveBeenCalledWith('/');
  });

  it('lets the player return to the completed feed without submitting an Alex answer', () => {
    completeFeed();
    render(<AlexFlow />);
    fireEvent.click(screen.getByRole('button', { name: 'Back to the feed' }));
    expect(router.replace).toHaveBeenCalledWith('/');
    expect(useCredibilityStore.getState().points).toBe(0);
  });

  it.each([
    [/Wait, Alex. The article claims/, 'right'],
    [/That's huge if it's true/, 'wrong'],
  ] as const)('offers results after feedback on the %s reply when the feed is complete', (answer, reply) => {
    completeFeed();
    showReplyButtons();
    fireEvent.click(screen.getByRole('button', { name: answer }));
    expect(screen.queryByRole('button', { name: 'View results' })).not.toBeInTheDocument();

    if (reply === 'right') {
      act(() => jest.advanceTimersByTime(1000));
    } else {
      fireEvent.click(screen.getByRole('button', { name: 'Got it! Continue' }));
    }

    expect(screen.queryByRole('button', { name: 'Back to the feed' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'View results' }));
    expect(router.replace).toHaveBeenCalledWith('/');
  });

  it('closes the unanswered question after results and offers a route back', () => {
    localStorage.setItem(
      'game_state',
      JSON.stringify({ state: { gameCompleted: true }, version: 0 })
    );
    showReplyButtons();

    expect(screen.getByText('Alex’s question is unavailable.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back to the feed' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Wait, Alex. The article claims/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /That's huge if it's true/ })).not.toBeInTheDocument();
    expect(useCredibilityStore.getState().points).toBe(0);
  });
});

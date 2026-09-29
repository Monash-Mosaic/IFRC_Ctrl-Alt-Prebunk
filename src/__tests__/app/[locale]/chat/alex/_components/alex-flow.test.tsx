import React from 'react';
import { act, fireEvent, render, renderHook, screen } from '@/test-utils/test-utils';
import { useTranslations } from 'next-intl';
import en from '@/messages/en.json';
import AlexFlow from '@/app/[locale]/chat/alex/_components/alex-flow';
import { defaultAlexChatState, type AlexChatState } from '@/lib/local-storage';
import { useAlexChat } from '@/lib/use-alex-chat';
import { useCredibilityStore } from '@/lib/use-credibility-store';

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

describe('AlexFlow', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
    router.replace.mockClear();
    (global as unknown as { mockUseRouter: jest.Mock }).mockUseRouter.mockReturnValue(router);
    (useTranslations as jest.Mock).mockImplementation((namespace?: string) => translate(namespace));
    setAlex(defaultAlexChatState);
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

    expect(screen.getByText('Here! https://link.com')).toBeInTheDocument();
    expect(useCredibilityStore.getState().points).toBe(0);

    fireEvent.click(screen.getByRole('button', { name: /Wait Alex, that sounds like/ }));
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText('Excellent catch!')).toBeInTheDocument();
    expect(screen.getByText(/Check other sources before sharing/)).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(useCredibilityStore.getState().points).toBe(5);
    expect(useCredibilityStore.getState().credibility).toBe(6);
  });

  it('shows the Not quite popup for the wrong reply and does not add points', () => {
    showReplyButtons();

    fireEvent.click(screen.getByRole('button', { name: /That's huge if true/ }));

    const popup = screen.getByRole('dialog');
    expect(popup).toHaveTextContent('Not quite');
    expect(popup).toHaveTextContent('You agreed to share a rumour with no evidence.');
    expect(screen.queryByText('Excellent catch!')).not.toBeInTheDocument();
    expect(useCredibilityStore.getState().points).toBe(0);
    expect(useCredibilityStore.getState().credibility).toBe(4);

    fireEvent.click(screen.getByRole('button', { name: 'Got it! Continue' }));
    expect(router.replace).toHaveBeenCalledWith('/');
  });
});

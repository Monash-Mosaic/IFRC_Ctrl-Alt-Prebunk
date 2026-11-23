import React from 'react';
import { act, render, renderHook, screen, waitFor, within } from '@/test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import ShareContent from '@/components/share-content';
import { type AlexChatState, defaultAlexChatState, STORAGE_KEYS } from '@/lib/local-storage';
import { useAlexChat } from '@/lib/use-alex-chat';
import { GAME_URL, SOLFERINO_ACADEMY_URL, WORLD_DISASTERS_REPORT_URL } from '@/lib/share-links';

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
  useLocale: jest.fn(() => 'en'),
}));

jest.mock('@/contents', () => ({
  __esModule: true,
  default: {
    en: { contentList: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }, { id: 'e' }] },
  },
}));

jest.mock('react-modal', () => {
  const Modal = ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) =>
    isOpen ? <div data-testid="react-modal">{children}</div> : null;
  Modal.setAppElement = jest.fn();
  return { __esModule: true, default: Modal };
});

const mockToBlob = jest.fn();
jest.mock('html-to-image', () => ({
  toPng: jest.fn(),
  toBlob: (...args: unknown[]) => mockToBlob(...args),
}));

const gameState = (correctAnswers: number, gameCompleted: boolean) =>
  JSON.stringify({
    state: { answers: {}, currentQuestionIndex: 0, gameCompleted, correctAnswers },
    version: 0,
  });

function setNavigator(props: Partial<Record<'share' | 'canShare' | 'clipboard', unknown>>) {
  for (const key of ['share', 'canShare', 'clipboard'] as const) {
    Object.defineProperty(navigator, key, { configurable: true, value: props[key] });
  }
}

// useAlexChat caches its state in memory, so set it through its own updater.
function setAlexChat(next: AlexChatState) {
  const hook = renderHook(() => useAlexChat());
  act(() => {
    hook.result.current[1](next);
  });
  hook.unmount();
}

describe('ShareContent', () => {
  beforeEach(() => {
    localStorage.clear();
    setAlexChat(defaultAlexChatState);
    setNavigator({});
  });

  it('replaces the placeholder with the four labelled share actions', () => {
    render(<ShareContent />);

    expect(screen.getByRole('heading', { level: 1, name: 'title' })).toBeInTheDocument();
    for (const action of ['game.action', 'report.action', 'academy.action', 'progress.action']) {
      expect(screen.getByRole('button', { name: action })).toBeInTheDocument();
    }
  });

  it.each([
    ['game.action', GAME_URL, 'game'],
    ['report.action', WORLD_DISASTERS_REPORT_URL, 'report'],
    ['academy.action', SOLFERINO_ACADEMY_URL, 'academy'],
  ])('%s shares the approved URL natively', async (action, url, key) => {
    const share = jest.fn().mockResolvedValue(undefined);
    setNavigator({ share, canShare: jest.fn(() => true) });
    const user = userEvent.setup();
    render(<ShareContent />);

    await user.click(screen.getByRole('button', { name: action }));

    // Exactly the title and the link: no extra text that a "Copy" target would glue onto the URL.
    expect(share).toHaveBeenCalledWith({ title: `${key}.shareTitle`, url });
    expect(await screen.findByRole('alert')).toHaveTextContent('feedback.shared');
  });

  it('falls back to copying the link and says so', async () => {
    // userEvent.setup() installs its own clipboard stub, so mock after it.
    const user = userEvent.setup();
    const writeText = jest.fn().mockResolvedValue(undefined);
    setNavigator({ clipboard: { writeText } });
    render(<ShareContent />);

    await user.click(screen.getByRole('button', { name: 'report.action' }));

    expect(writeText).toHaveBeenCalledWith(WORLD_DISASTERS_REPORT_URL);
    expect(await screen.findByRole('alert')).toHaveTextContent('feedback.copied');
  });

  it('reports cancellation and failure clearly', async () => {
    const user = userEvent.setup();
    setNavigator({
      share: jest.fn().mockRejectedValue(Object.assign(new Error('x'), { name: 'AbortError' })),
    });
    const { unmount } = render(<ShareContent />);
    await user.click(screen.getByRole('button', { name: 'game.action' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('feedback.cancelled');
    unmount();

    setNavigator({ clipboard: { writeText: jest.fn().mockRejectedValue(new Error('denied')) } });
    render(<ShareContent />);
    await user.click(screen.getByRole('button', { name: 'game.action' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('feedback.linkFailed');
  });

  it('offers a selected, copyable link when sharing and copying both fail', async () => {
    const user = userEvent.setup();
    const writeText = jest
      .fn()
      .mockRejectedValueOnce(new Error('denied'))
      .mockResolvedValueOnce(undefined);
    setNavigator({ clipboard: { writeText } });
    render(<ShareContent />);

    await user.click(screen.getByRole('button', { name: 'report.action' }));

    const field = await screen.findByRole('textbox', { name: 'feedback.linkLabel' });
    expect(field).toHaveValue(WORLD_DISASTERS_REPORT_URL);
    expect(field).toHaveAttribute('readonly');
    expect(field).toHaveFocus();
    // Only the failing option shows the field.
    expect(screen.getAllByRole('textbox')).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'feedback.copyLink' }));

    expect(writeText).toHaveBeenLastCalledWith(WORLD_DISASTERS_REPORT_URL);
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('feedback.copied'));
  });

  it('keeps the link selected and explains a manual copy when copying keeps failing', async () => {
    const user = userEvent.setup();
    setNavigator({ clipboard: { writeText: jest.fn().mockRejectedValue(new Error('denied')) } });
    render(<ShareContent />);

    await user.click(screen.getByRole('button', { name: 'game.action' }));
    await user.click(await screen.findByRole('button', { name: 'feedback.copyLink' }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('feedback.manualCopy')
    );
    expect(screen.getByRole('textbox', { name: 'feedback.linkLabel' })).toHaveFocus();
  });

  it('hides the copy field again once a later share succeeds', async () => {
    const user = userEvent.setup();
    const writeText = jest
      .fn()
      .mockRejectedValueOnce(new Error('denied'))
      .mockResolvedValue(undefined);
    setNavigator({ clipboard: { writeText } });
    render(<ShareContent />);

    await user.click(screen.getByRole('button', { name: 'game.action' }));
    await screen.findByRole('textbox');
    await user.click(screen.getByRole('button', { name: 'game.action' }));

    await waitFor(() => expect(screen.queryByRole('textbox')).not.toBeInTheDocument());
  });

  it('keeps progress sharing unavailable until the simulation is complete', () => {
    localStorage.setItem(STORAGE_KEYS.GAME_STATE, gameState(2, false));
    render(<ShareContent />);

    const button = screen.getByRole('button', { name: 'progress.action' });
    expect(button).toBeDisabled();
    expect(button).toHaveAccessibleDescription('progress.locked');
  });

  it('shares the actual result once the simulation is complete', async () => {
    localStorage.setItem(STORAGE_KEYS.GAME_STATE, gameState(3, true));
    const share = jest.fn().mockResolvedValue(undefined);
    setNavigator({ share, canShare: jest.fn(() => true) });
    mockToBlob.mockResolvedValue(new Blob(['image'], { type: 'image/png' }));
    const user = userEvent.setup();
    render(<ShareContent />);

    const button = screen.getByRole('button', { name: 'progress.action' });
    expect(button).toBeEnabled();
    await user.click(button);

    const modal = await screen.findByTestId('react-modal');
    // 3/5 = 60%, so the same tier the completion screen shows.
    expect(within(modal).getByText('3/5')).toBeInTheDocument();
    expect(within(modal).getByText('Prebunker')).toBeInTheDocument();

    await user.click(within(modal).getByRole('button', { name: /^share$/i }));

    await waitFor(() => expect(share).toHaveBeenCalled());
    expect(share.mock.calls[0][0]).toMatchObject({ title: 'Prebunker' });
    expect(share.mock.calls[0][0].text).toContain('3/5');
    expect(await screen.findByRole('alert')).toHaveTextContent('feedback.shared');
  });

  it.each([
    ['skipped', defaultAlexChatState, '5/5'],
    ['answered incorrectly', { notified: true, reply: 'wrong' }, '5/6'],
    ['answered correctly', { notified: true, reply: 'right' }, '6/6'],
  ] as const)('includes Alex in the shared score when Alex is %s', async (_, alexChat, score) => {
    localStorage.setItem(STORAGE_KEYS.GAME_STATE, gameState(5, true));
    setAlexChat(alexChat);
    const share = jest.fn().mockResolvedValue(undefined);
    setNavigator({ share, canShare: jest.fn(() => true) });
    mockToBlob.mockResolvedValue(new Blob(['image'], { type: 'image/png' }));
    const user = userEvent.setup();
    render(<ShareContent />);

    expect(screen.getByText(`progress.result`)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'progress.action' }));
    const modal = await screen.findByTestId('react-modal');
    expect(within(modal).getByText(score)).toBeInTheDocument();

    await user.click(within(modal).getByRole('button', { name: /^share$/i }));
    await waitFor(() => expect(share).toHaveBeenCalled());
    expect(share.mock.calls[0][0].text).toContain(score);
  });

  it('unlocks progress sharing as soon as the results screen is reached', () => {
    localStorage.setItem(STORAGE_KEYS.GAME_STATE, gameState(2, false));
    render(<ShareContent />);
    expect(screen.getByRole('button', { name: 'progress.action' })).toBeDisabled();

    act(() => {
      localStorage.setItem(STORAGE_KEYS.GAME_STATE, gameState(2, true));
      window.dispatchEvent(new Event('prebunk:game-state-changed'));
    });

    expect(screen.getByRole('button', { name: 'progress.action' })).toBeEnabled();
  });

  it('never changes stored game state when sharing', async () => {
    const stored = gameState(4, true);
    localStorage.setItem(STORAGE_KEYS.GAME_STATE, stored);
    const user = userEvent.setup();
    setNavigator({ clipboard: { writeText: jest.fn().mockResolvedValue(undefined) } });
    render(<ShareContent />);

    await user.click(screen.getByRole('button', { name: 'game.action' }));
    await screen.findByRole('alert');

    expect(localStorage.getItem(STORAGE_KEYS.GAME_STATE)).toBe(stored);
  });
});

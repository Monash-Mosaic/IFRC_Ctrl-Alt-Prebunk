import React from 'react';
import { render, screen, waitFor, within } from '@/test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import ShareContent from '@/components/share-content';
import { STORAGE_KEYS } from '@/lib/local-storage';
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

describe('ShareContent', () => {
  beforeEach(() => {
    localStorage.clear();
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

    expect(share).toHaveBeenCalledWith({
      title: `${key}.shareTitle`,
      text: `${key}.shareText`,
      url,
    });
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

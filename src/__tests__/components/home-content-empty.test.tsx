/**
 * HomeContent must stay usable when a locale ships no gameplay content:
 * the feed renders empty and the desktop controls respond without crashing.
 */
import React from 'react';
import { render, screen } from '@/test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import HomeContent from '@/components/home-content';
import { useCredibilityStore } from '@/lib/use-credibility-store';

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
  useLocale: jest.fn(() => 'en'),
}));

jest.mock('@/lib/use-local-storage', () => ({
  useLocalStorage: jest.fn(() => [true, jest.fn()]),
}));

jest.mock('@/lib/use-credibility-store');

jest.mock('@/contents', () => ({
  __esModule: true,
  default: { en: { content: {}, contentList: [] } },
}));

describe('HomeContent with no content', () => {
  beforeEach(() => {
    window.localStorage.clear();
    (useCredibilityStore as unknown as jest.Mock).mockReturnValue({
      addPoints: jest.fn(),
      increaseCredibility: jest.fn(),
      decreaseCredibility: jest.fn(),
      initCredibility: jest.fn(),
      resetCredibility: jest.fn(),
    });
  });

  it('renders an empty, unlocked feed with inactive controls', async () => {
    const user = userEvent.setup();
    render(<HomeContent />);

    const feed = screen.getByRole('feed');
    expect(feed.querySelectorAll('[data-post-index]')).toHaveLength(0);
    expect(screen.queryByText('lockedHint')).not.toBeInTheDocument();

    const next = screen.getByRole('button', { name: 'Next post' });
    expect(next).toHaveAttribute('aria-disabled', 'true');
    await user.click(next);
    expect(screen.getByRole('alert')).toHaveTextContent('alreadyLast');
  });
});

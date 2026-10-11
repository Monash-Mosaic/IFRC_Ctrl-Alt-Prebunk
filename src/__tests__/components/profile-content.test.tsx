import React from 'react';
import { act, render, screen } from '@/test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import ProfileContent from '@/components/profile-content';
import { STORAGE_KEYS } from '@/lib/local-storage';
import { DEFAULT_AVATAR_ID, PROFILE_AVATARS } from '@/lib/profile-avatars';
import { useCredibilityStore } from '@/lib/use-credibility-store';
import { useProfileStore } from '@/lib/use-profile-store';

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

const GAME_STATE = JSON.stringify({
  state: { answers: { a: 'like', b: 'c', c: 'dislike' }, currentQuestionIndex: 3, gameCompleted: false, correctAnswers: 2 },
  version: 0,
});

describe('ProfileContent', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEYS.GAME_STATE, GAME_STATE);
    act(() => {
      useProfileStore.setState({ username: '', avatarId: DEFAULT_AVATAR_ID });
      useCredibilityStore.setState({ points: 10, credibility: 1, initialCredibility: 2, clickedLinks: [] });
    });
  });

  it('replaces the under-development placeholder with the profile', () => {
    render(<ProfileContent />);

    expect(screen.getByRole('heading', { level: 1, name: 'title' })).toBeInTheDocument();
    expect(screen.queryByText('Under Development')).not.toBeInTheDocument();
  });

  it('shows the default name, the selected avatar and the stored score', () => {
    render(<ProfileContent />);

    expect(screen.getByTestId('profile-username')).toHaveTextContent('defaultUsername');
    expect(screen.getByTestId('profile-score')).toHaveTextContent('2/5');
    expect(screen.getByRole('progressbar', { name: 'credibility' })).toHaveAttribute(
      'aria-valuenow',
      '50'
    );
    expect(screen.getByRole('radio', { name: 'avatars.green' })).toBeChecked();
  });

  it('shows a saved username', () => {
    act(() => {
      useProfileStore.setState({ username: 'Alex' });
    });
    render(<ProfileContent />);

    expect(screen.getByTestId('profile-username')).toHaveTextContent('Alex');
  });

  it('edits the username with the keyboard and returns focus to the edit button', async () => {
    const user = userEvent.setup();
    render(<ProfileContent />);

    await user.click(screen.getByRole('button', { name: 'editUsername' }));
    const input = screen.getByRole('textbox', { name: 'usernameLabel' });
    expect(input).toHaveFocus();

    await user.type(input, '  Sam  {Enter}');

    expect(screen.getByTestId('profile-username')).toHaveTextContent('Sam');
    expect(useProfileStore.getState().username).toBe('Sam');
    expect(screen.getByRole('button', { name: 'editUsername' })).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('usernameSaved');
  });

  it('rejects an empty username and explains why', async () => {
    const user = userEvent.setup();
    act(() => {
      useProfileStore.setState({ username: 'Alex' });
    });
    render(<ProfileContent />);

    await user.click(screen.getByRole('button', { name: 'editUsername' }));
    const input = screen.getByRole('textbox', { name: 'usernameLabel' });
    await user.clear(input);
    await user.click(screen.getByRole('button', { name: 'save' }));

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(/usernameRequired/);
    expect(useProfileStore.getState().username).toBe('Alex');
  });

  it('cancels editing with Escape without saving', async () => {
    const user = userEvent.setup();
    act(() => {
      useProfileStore.setState({ username: 'Alex' });
    });
    render(<ProfileContent />);

    await user.click(screen.getByRole('button', { name: 'editUsername' }));
    await user.type(screen.getByRole('textbox', { name: 'usernameLabel' }), 'Changed{Escape}');

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByTestId('profile-username')).toHaveTextContent('Alex');
    expect(useProfileStore.getState().username).toBe('Alex');
  });

  it('offers every preset avatar as a labelled radio and saves the selection', async () => {
    const user = userEvent.setup();
    render(<ProfileContent />);

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(PROFILE_AVATARS.length);
    expect(screen.getByRole('group', { name: 'avatarLabel' })).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'avatars.blue' }));

    expect(useProfileStore.getState().avatarId).toBe('avatar-2');
    expect(screen.getByRole('radio', { name: 'avatars.blue' })).toBeChecked();
    expect(screen.getByRole('status')).toHaveTextContent('avatarSaved');
  });

  it('never changes score, credibility or quiz progress while editing', async () => {
    const user = userEvent.setup();
    render(<ProfileContent />);
    const credibilityBefore = { ...useCredibilityStore.getState() };

    await user.click(screen.getByRole('button', { name: 'editUsername' }));
    await user.type(screen.getByRole('textbox', { name: 'usernameLabel' }), 'Sam{Enter}');
    await user.click(screen.getByRole('radio', { name: 'avatars.red' }));

    expect(localStorage.getItem(STORAGE_KEYS.GAME_STATE)).toBe(GAME_STATE);
    const credibilityAfter = useCredibilityStore.getState();
    expect(credibilityAfter.points).toBe(credibilityBefore.points);
    expect(credibilityAfter.credibility).toBe(credibilityBefore.credibility);
    expect(credibilityAfter.initialCredibility).toBe(credibilityBefore.initialCredibility);
    expect(screen.getByTestId('profile-score')).toHaveTextContent('2/5');
  });

  it('shows a zero score when no game has been played or storage is corrupt', () => {
    localStorage.setItem(STORAGE_KEYS.GAME_STATE, '{not json');
    render(<ProfileContent />);

    expect(screen.getByTestId('profile-score')).toHaveTextContent('0/5');
  });
});

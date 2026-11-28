import { act, render, screen } from '@/test-utils/test-utils';
import ChatPage from '@/app/[locale]/chat/page';
import { STORAGE_KEYS, storage } from '@/lib/local-storage';

it('keeps Paula completed from onboarding until restart, including after the results', () => {
  storage.clear();
  render(<ChatPage />);

  expect(screen.getByRole('link', { name: 'paula newMessage' })).toHaveAttribute(
    'href',
    '/chat/onboarding'
  );

  act(() => storage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, true));

  expect(screen.getByRole('button', { name: 'paula onboardingComplete' })).toBeDisabled();
  expect(screen.queryByRole('link', { name: /paula/ })).not.toBeInTheDocument();

  act(() => storage.setItem(STORAGE_KEYS.GAME_STATE, { state: { gameCompleted: true } }));

  expect(screen.getByRole('button', { name: 'paula onboardingComplete' })).toBeDisabled();

  act(() => {
    storage.removeItem(STORAGE_KEYS.GAME_STATE);
    storage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, false);
  });

  expect(screen.getByRole('link', { name: 'paula newMessage' })).toBeInTheDocument();
});

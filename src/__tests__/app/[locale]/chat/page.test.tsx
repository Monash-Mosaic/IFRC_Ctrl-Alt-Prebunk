import { act, render, screen } from '@/test-utils/test-utils';
import ChatPage from '@/app/[locale]/chat/page';
import { STORAGE_KEYS, storage } from '@/lib/local-storage';

it('locks Paula while the quiz is in progress and restores the link after restart', () => {
  storage.clear();
  render(<ChatPage />);

  expect(screen.getByRole('link', { name: 'paula newMessage' })).toHaveAttribute(
    'href',
    '/chat/onboarding'
  );

  act(() => storage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, true));

  expect(screen.getByRole('button', { name: 'paula onboardingComplete' })).toBeDisabled();
  expect(screen.queryByRole('link', { name: /paula/ })).not.toBeInTheDocument();

  act(() => storage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED));

  expect(screen.getByRole('link', { name: 'paula newMessage' })).toBeInTheDocument();
});

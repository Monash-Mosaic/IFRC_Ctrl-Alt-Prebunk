import { act, render, screen } from '@/test-utils/test-utils';
import ChatPage from '@/app/[locale]/chat/page';
import { STORAGE_KEYS, storage } from '@/lib/local-storage';

it('offers Paula’s saved conversation immediately after onboarding and until restart', () => {
  storage.clear();
  render(<ChatPage />);

  expect(screen.getByRole('link', { name: 'paula newMessage' })).toHaveAttribute(
    'href',
    '/chat/onboarding'
  );

  act(() => {
    storage.setItem(STORAGE_KEYS.PAULA_CHAT_HISTORY, {
      messages: [{ id: '1', type: 'text', sender: 'paula', text: 'step1.greeting', timestamp: 0 }],
      practiceAnswer: null,
    });
    storage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
  });

  expect(screen.getByRole('link', { name: 'paula' })).toHaveAttribute('href', '/chat/onboarding');

  act(() => storage.setItem(STORAGE_KEYS.GAME_STATE, { state: { gameCompleted: true } }));

  expect(screen.getByRole('link', { name: 'paula' })).toHaveAttribute('href', '/chat/onboarding');

  act(() => {
    storage.removeItem(STORAGE_KEYS.GAME_STATE);
    storage.removeItem(STORAGE_KEYS.PAULA_CHAT_HISTORY);
    storage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, false);
  });

  expect(screen.getByRole('link', { name: 'paula newMessage' })).toBeInTheDocument();
});

it('does not list a Paula conversation after results when there is no saved transcript', () => {
  storage.clear();
  storage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
  storage.setItem(STORAGE_KEYS.GAME_STATE, { state: { gameCompleted: true } });

  render(<ChatPage />);

  expect(screen.queryByText('paula')).not.toBeInTheDocument();
});

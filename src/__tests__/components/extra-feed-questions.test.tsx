import { render, renderHook, screen, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomeContent from '@/components/home-content';
import PointsCredibilityBar from '@/components/points-credibility-bar';
import { STORAGE_KEYS, storage } from '@/lib/local-storage';
import { useAlexChat } from '@/lib/use-alex-chat';
import { useCredibilityStore } from '@/lib/use-credibility-store';

jest.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => key,
}));

// The previously answered cards contain MDX, which the Jest config replaces with file objects.
jest.mock('@/components/newfeeds/mcq-post-message', () => () => null);
jest.mock('@/components/newfeeds/like-dislike-post-message', () => () => null);
jest.mock('../../app/[locale]/chat/onboarding/_posts/en/EchoPost.md', () => ({
  __esModule: true,
  default: () => <p>Echo’s onboarding example</p>,
}));

const originalAnswers = {
  'mcq-2': 'c',
  'like-dislike-6': 'dislike',
  'like-dislike-7': 'dislike',
  'mcq-3': 'b',
  'like-dislike-8': 'like',
};

function saveOriginalFeed(gameCompleted = false) {
  storage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
  storage.setItem(STORAGE_KEYS.GAME_STATE, {
    version: 0,
    state: {
      answers: originalAnswers,
      currentQuestionIndex: 4,
      correctAnswers: 5,
      gameCompleted,
    },
  });
}

function renderFeed() {
  return render(
    <>
      <PointsCredibilityBar />
      <main id="root">
        <HomeContent />
      </main>
    </>
  );
}

beforeEach(() => {
  window.localStorage.clear();
  useCredibilityStore.getState().resetCredibility(7);
  const { result, unmount } = renderHook(useAlexChat);
  act(() => result.current[1]({ notified: true, reply: null }));
  unmount();
});

it('resumes the five-question feed and counts both new scored posts before showing results', async () => {
  saveOriginalFeed();
  const user = userEvent.setup();
  renderFeed();

  expect(screen.getByText('score: 5/7')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'comments' })).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'skip' }));
  const skipFeedback = within(screen.getByRole('dialog', { name: 'modalLabel' }));
  expect(skipFeedback.getByText('Exactly!')).toBeInTheDocument();
  expect(skipFeedback.getByText(/Check the UN’s website before sharing the claim/))
    .toBeInTheDocument();
  expect(skipFeedback.queryByRole('region', { name: 'sharedPost' })).not.toBeInTheDocument();
  expect(skipFeedback.queryByRole('heading', { name: 'friendReplied' })).not.toBeInTheDocument();
  expect(skipFeedback.getByRole('img', { name: 'verifiedBadge' })).toBeInTheDocument();
  await user.click(skipFeedback.getByRole('button', { name: 'continueButton' }));
  expect(storage.getItem(STORAGE_KEYS.ALEX_CHAT)).toEqual({ notified: true, reply: null });
  expect(screen.getByText('score: 6/7')).toBeInTheDocument();

  expect(screen.getByText('Echo’s onboarding example')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'Snow-covered trees beside a frozen lake' }))
    .toHaveAttribute('src', expect.stringContaining('echo-post-img.jpg'));
  const commentsButton = screen.getByRole('button', { name: 'comments' });
  expect(commentsButton).toHaveTextContent('comments');
  expect(commentsButton).toHaveAccessibleDescription('readAndReply');
  expect(screen.getByText('finishFeedHint')).toBeInTheDocument();
  await user.click(commentsButton);
  let thread = within(screen.getByRole('dialog', { name: 'comments' }));
  expect(thread.getByText(/Victoria just broke a cold-weather record/)).toBeInTheDocument();
  expect(thread.getByRole('heading', { name: 'Echo' }).closest('article')?.querySelector('mask'))
    .toBeInTheDocument();
  await user.click(thread.getByRole('button', { name: 'close' }));
  await user.click(screen.getByRole('button', { name: 'comments' }));
  thread = within(screen.getByRole('dialog', { name: 'comments' }));
  const correctResponse = /Victoria can set a cold-weather record even while the planet is warming/;
  await user.click(thread.getByRole('button', { name: correctResponse }));

  expect(thread.getByText('yourReply')).toBeInTheDocument();
  expect(thread.getByRole('presentation')).toHaveAttribute(
    'src',
    '/images/example/player-comment-avatar.webp'
  );
  const feedbackReply = thread.getByRole('heading', { name: 'feedback' }).closest('article');
  expect(feedbackReply).toHaveFocus();
  expect(feedbackReply?.querySelector('img, svg')).toBeNull();
  expect(thread.getByText('Good catch!')).toBeInTheDocument();
  expect(thread.getByRole('blockquote')).toHaveTextContent(correctResponse);
  expect(thread.queryByRole('button', { name: correctResponse })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'viewResults' })).not.toBeInTheDocument();
  await user.click(thread.getByRole('button', { name: 'continueButton' }));
  expect(screen.queryByText('readAndReply')).not.toBeInTheDocument();
  expect(screen.getByText('score: 7/7')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'viewResults' }));
  expect(screen.getByText('Simulation complete!')).toBeInTheDocument();
  expect(screen.getByText('7/7')).toBeInTheDocument();
});

it('gives explanatory feedback for wrong choices and includes Alex only when answered', async () => {
  saveOriginalFeed();
  const { result, unmount } = renderHook(useAlexChat);
  act(() => result.current[1]({ notified: true, reply: 'right' }));
  unmount();
  const user = userEvent.setup();
  renderFeed();

  await user.click(screen.getByRole('button', { name: 'share' }));
  const shareFeedback = within(screen.getByRole('dialog', { name: 'modalLabel' }));
  const sentPost = within(shareFeedback.getByRole('region', { name: 'sharedPost' }));
  expect(sentPost.getByText('@climate_truth_warrior')).toBeInTheDocument();
  expect(sentPost.getByText(/59\.3 gigatonnes/)).toBeInTheDocument();
  expect(shareFeedback.getByText('Not quite!')).toBeInTheDocument();
  const friendReply = shareFeedback.getByRole('heading', { name: 'friendReplied' });
  expect(friendReply.querySelector('svg')).toBeInTheDocument();
  expect(shareFeedback.getByText(/By sharing this post, you passed on an unverified claim/))
    .toBeInTheDocument();
  expect(shareFeedback.getByRole('img', { name: 'verifiedBadge' })).toBeInTheDocument();
  const credibilityAfterSharing = useCredibilityStore.getState().credibility;
  await user.click(shareFeedback.getByRole('button', { name: 'continueButton' }));

  await user.click(screen.getByRole('button', { name: 'Previous post' }));
  const answeredShare = screen.getByRole('button', { name: 'share' });
  expect(answeredShare).toBeDisabled();
  expect(answeredShare).toHaveAttribute('aria-pressed', 'true');
  expect(screen.queryByRole('button', { name: 'viewFeedback' })).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Next post' }));
  expect(useCredibilityStore.getState().credibility).toBe(credibilityAfterSharing);

  await user.click(screen.getByRole('button', { name: 'comments' }));
  const thread = within(screen.getByRole('dialog', { name: 'comments' }));
  await user.click(thread.getByRole('button', { name: /A record cold day is enough/ }));
  expect(thread.getByText('Watch out for cherry-picking.')).toBeInTheDocument();
  await user.click(thread.getByRole('button', { name: 'continueButton' }));

  expect(screen.getByText('Simulation complete!')).toBeInTheDocument();
  expect(screen.getByText('6/8')).toBeInTheDocument();
  expect(useCredibilityStore.getState().credibility).toBe(1);
});

it('keeps the completed score from the previous release', () => {
  saveOriginalFeed(true);
  renderFeed();

  expect(screen.getByText('score: 5/5')).toBeInTheDocument();
  expect(screen.getByText('5/5')).toBeInTheDocument();
});

it('uses the warning light photo for the Share question', () => {
  saveOriginalFeed();
  renderFeed();

  expect(screen.getByRole('img', { name: 'Red emergency warning light' })).toHaveAttribute(
    'src',
    expect.stringContaining('question-04.webp')
  );
});

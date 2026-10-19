import React from 'react';
import { act, fireEvent, render, screen } from '@/test-utils/test-utils';
import OnboardingFlow from '@/app/[locale]/chat/onboarding/_components/onboarding-flow';
import { useCredibilityStore } from '@/lib/use-credibility-store';
import { STORAGE_KEYS } from '@/lib/local-storage';
import CONTENTS from '@/contents';
import { ContentType } from '@/contents/en';

// NOTE: deviation from the brief — jsdom does not implement Element.scrollIntoView,
// and OnboardingFlow calls messagesEndRef.current?.scrollIntoView(...) in a useEffect
// on every render. Without this polyfill every test in this file fails with
// "scrollIntoView is not a function" as soon as the component mounts, unrelated to
// anything this task changes.
Element.prototype.scrollIntoView = jest.fn();

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
  useLocale: jest.fn(() => 'en'),
}));

const mockGetAnswer = jest.fn();
const mockSetAnswer = jest.fn();
const mockIsAnswered = jest.fn();
const mockMoveToNextQuestion = jest.fn();
const mockIncrCorrectAnswers = jest.fn();

const mockPracticeGameStore = jest.fn(() => ({
  getAnswer: mockGetAnswer,
  setAnswer: mockSetAnswer,
  isAnswered: mockIsAnswered,
  moveToNextQuestion: mockMoveToNextQuestion,
  incrCorrectAnswers: mockIncrCorrectAnswers,
}));

jest.mock('@/lib/use-game-store', () => ({
  createGameStore: jest.fn(() => mockPracticeGameStore),
}));

jest.mock('@/lib/use-credibility-store');

// NOTE: deviation from the brief — the content item literal is defined *inside* the
// jest.mock('@/contents', ...) factory (rather than as an outer `const` referenced by
// the factory) because this repo's jest config (next/jest, SWC-based hoisting) hoists
// jest.mock() factory evaluation to run as part of the OnboardingFlow import chain,
// before any outer top-level `const` in this file has initialized. Referencing an
// outer-scope object from the factory — even one named with a `mock` prefix — throws
// "Cannot access '...' before initialization". Keeping the object fully local to the
// factory avoids the TDZ hazard while producing the exact same mocked module shape.
jest.mock('@/contents', () => {
  const mockPracticeContentItem = {
    id: 'practice-mcq',
    type: 'mcq',
    post: {
      id: 'practice-mcq',
      user: { id: 'echo', name: 'Echo', handle: '@echo', avatar: null, isUser: false },
      content: <div>Practice MCQ question</div>,
    },
    options: [
      { id: 'opt-a', label: 'Correct option' },
      { id: 'opt-b', label: 'Incorrect option' },
    ],
    correctOptionId: 'opt-a',
    whyCorrectAnswer: {
      title: <div>Practice Correct Title</div>,
      content: <div>Practice Correct Content</div>,
    },
    whyIncorrectAnswer: {
      title: <div>Practice Incorrect Title</div>,
      content: <div>Practice Incorrect Content</div>,
    },
  };

    const mockLiveQ1 = {
    ...mockPracticeContentItem,
    id: 'live-q1',
    post: { ...mockPracticeContentItem.post, id: 'live-q1' },
  };

  return {
    __esModule: true,
    default: {
      en: {
          content: {
          'live-q1': mockLiveQ1,
        },
        contentList: [mockLiveQ1],
        practiceContent: { 'example-mcq': mockPracticeContentItem },

      },
    },
  };
});

jest.mock('@/components/newfeeds/mcq-post-message', () => {
  return function MockMCQPostMessage({ postId, answer, onAnswer }: any) {
    return (
      <div data-testid={`practice-mcq-post-${postId}`}>
        <div data-testid={`practice-mcq-answer-${postId}`}>{answer || 'null'}</div>
        <button data-testid={`practice-mcq-correct-${postId}`} onClick={() => onAnswer?.(postId, 'opt-a')}>
          Answer correctly
        </button>
        <button data-testid={`practice-mcq-incorrect-${postId}`} onClick={() => onAnswer?.(postId, 'opt-b')}>
          Answer incorrectly
        </button>
      </div>
    );
  };
});

// jest.mock('@/components/newfeeds/prebunking-modal', () => {
//   return function MockPrebunkingModal({ isOpen, onClose, onContinue, postId, header, content }: any) {
//     if (!isOpen) return null;
//     return (
//       <div data-testid={`practice-modal-${postId}`}>
//         <div data-testid={`practice-modal-header-${postId}`}>{header}</div>
//         <div data-testid={`practice-modal-content-${postId}`}>{content}</div>
//         <button data-testid={`practice-modal-close-${postId}`} onClick={onClose}>Close</button>
//         <button data-testid={`practice-modal-continue-${postId}`} onClick={onContinue}>Continue</button>
//       </div>
//     );
//   };
// });

const mockAddPoints = jest.fn();
const mockIncreaseCredibility = jest.fn();
const mockDecreaseCredibility = jest.fn();
const mockInitCredibility = jest.fn();

describe('OnboardingFlow practice question', () => {
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2020-08-20T00:12:00.000Z'));
    window.localStorage.clear();

    mockGetAnswer.mockReturnValue(null);
    mockIsAnswered.mockReturnValue(false);
    // Wire setAnswer -> getAnswer like the real game store: without this, mockGetAnswer
    // keeps returning whatever beforeEach hardcoded (null) even after mockSetAnswer is
    // called, since they're otherwise-independent jest.fn()s. Same pattern used in
    // src/__tests__/components/home-content.test.tsx.
    mockSetAnswer.mockImplementation((postId: string, answer: string) => {
      mockGetAnswer.mockImplementation((id: string) => (id === postId ? answer : null));
    });

    (global as any).mockUseRouter.mockReturnValue({
      push: jest.fn(),
      replace: mockReplace,
      prefetch: jest.fn(),
    });

    jest.mocked(useCredibilityStore).mockReturnValue({
      addPoints: mockAddPoints,
      increaseCredibility: mockIncreaseCredibility,
      decreaseCredibility: mockDecreaseCredibility,
      initCredibility: mockInitCredibility,
      resetCredibility: jest.fn(),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const advanceToPractice = () => {
    render(<OnboardingFlow />);
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    act(() => {
      fireEvent.click(screen.getByText('step1.option3'));
    });
    act(() => {
      jest.advanceTimersByTime(1000);
    });
  };

  it('renders the separate practice question instead of live Q1', () => {
    advanceToPractice();

    expect(screen.getByText('practice.mcq')).toBeInTheDocument();
    expect(screen.getByTestId('practice-mcq-post-practice-mcq')).toBeInTheDocument();
    expect(screen.queryByTestId('practice-mcq-post-live-q1')).not.toBeInTheDocument();
  });


  // it('does not fall through to Like/Report for an unsupported practice post', () => {
  //   const originalItem = CONTENTS.en.contentList[0];
  //   CONTENTS.en.contentList[0] = {
  //     id: 'unsupported-share',
  //     type: ContentType.SHARE,
  //     correctAnswer: 'share',
  //     whyCorrectAnswer: { title: null, content: null },
  //     whyIncorrectAnswer: { title: null, content: null },
  //   };
  //   try {
  //     advanceToPractice();
  //     expect(screen.queryByRole('article')).not.toBeInTheDocument();
  //     expect(screen.queryByRole('button', { name: /like|report|dislike/i })).not.toBeInTheDocument();
  //     expect(mockSetAnswer).not.toHaveBeenCalled();
  //   } finally {
  //     CONTENTS.en.contentList[0] = originalItem;
  //   }
  // });

  it('keeps the example answer off the scored game and still shows the feedback modal', () => {
    advanceToPractice();

    act(() => {
      fireEvent.click(screen.getByTestId('practice-mcq-correct-practice-mcq'));
    });

    expect(mockSetAnswer).not.toHaveBeenCalled();
    expect(mockInitCredibility).not.toHaveBeenCalled();
    expect(mockIncreaseCredibility).not.toHaveBeenCalled();
    expect(mockAddPoints).not.toHaveBeenCalled();
    expect(mockIncrCorrectAnswers).not.toHaveBeenCalled();
    expect(mockDecreaseCredibility).not.toHaveBeenCalled();

    expect(screen.getByText('Correct option')).toBeInTheDocument();
    expect(screen.getByText('Practice Correct Title')).toBeInTheDocument();
    expect(screen.getByText('Practice Correct Content')).toBeInTheDocument();
    expect(screen.getByText('step3.option1')).toBeInTheDocument();

  });

  it('shows the incorrect explanation without scoring the example', () => {
    advanceToPractice();

    act(() => {
      fireEvent.click(screen.getByTestId('practice-mcq-incorrect-practice-mcq'));
    });

    expect(mockSetAnswer).not.toHaveBeenCalled();
    expect(mockDecreaseCredibility).not.toHaveBeenCalled();
    expect(mockAddPoints).not.toHaveBeenCalled();
    expect(screen.getByText('Incorrect option')).toBeInTheDocument();
    expect(screen.getByText('Practice Incorrect Title')).toBeInTheDocument();
    expect(screen.getByText('Practice Incorrect Content')).toBeInTheDocument();
  });

  it('enters the feed from the handoff response after practice', () => {
    advanceToPractice();

    act(() => {
      fireEvent.click(screen.getByTestId('practice-mcq-correct-practice-mcq'));
    });
    act(() => {
      fireEvent.click(screen.getByText('step3.option1'));
    });

    expect(mockMoveToNextQuestion).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/');
    expect(window.localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED)).toBe('true');
  });

  it('returns to locale home without starting the quiz', () => {
    render(<OnboardingFlow />);
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    act(() => {
      fireEvent.click(screen.getByText('step1.option3'));
    });
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    act(() => {
      fireEvent.click(screen.getByText('returnHome'));
    });

    expect(mockReplace).toHaveBeenCalledWith('/');
    expect(window.localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED)).not.toBe('true');
    expect(window.localStorage.getItem(STORAGE_KEYS.CHAT_ONBOARDING_STATE)).toBeNull();
  });
});

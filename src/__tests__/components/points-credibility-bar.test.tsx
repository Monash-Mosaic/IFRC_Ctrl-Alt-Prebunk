import { render, screen } from '@/test-utils/test-utils';
import PointsCredibilityBar from '@/components/points-credibility-bar';
import { useCredibilityStore } from '@/lib/use-credibility-store';
import { createGameStore } from '@/lib/use-game-store';

// Create a shared state object that can be modified
const createMockState = () => ({
  points: 0,
  credibility: 3,
  initialCredibility: 5,
});

// Store state in a way that's accessible to both mock and tests
let currentMockState = createMockState();

// Mock the store
jest.mock('@/lib/use-credibility-store', () => ({
  useCredibilityStore: jest.fn((selector) => {
    if (selector) {
      return selector(currentMockState);
    }
    return currentMockState;
  }),
}));

// Mock next-intl (locale is needed to look up CONTENTS[locale].contentList.length)
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
  useLocale: jest.fn(() => 'en'),
}));

// Mock @/contents so totalQuestions is a known, stable value regardless of real content changes
jest.mock('@/contents', () => ({
  __esModule: true,
  default: {
    en: {
      contentList: [{ id: '1' }, { id: '2' }],
    },
  },
}));

describe('PointsCredibilityBar', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset to default values before each test
    currentMockState = createMockState();
    // Update the mock implementation to use the new state
    jest.mocked(useCredibilityStore).mockImplementation(((selector?: (state: typeof currentMockState) => unknown) => {
      if (selector) {
        return selector(currentMockState);
      }
      return currentMockState;
    }) as typeof useCredibilityStore);
    jest.clearAllMocks();
  });

  it('renders the component', () => {
    render(<PointsCredibilityBar />);
    expect(screen.getByText(/score/i)).toBeInTheDocument();
  });

  it('displays default score value', () => {
    render(<PointsCredibilityBar />);
    // Translation returns the key, so we check for "score"
    expect(screen.getByText(/score/i)).toBeInTheDocument();
    const scoreSpan = screen.getByText(/score/i);
    expect(scoreSpan).toHaveTextContent('0/2');
  });

  it('excludes non-answer points from the quiz score', () => {
    currentMockState.points = 2;
    createGameStore().getState().incrCorrectAnswers();
    render(<PointsCredibilityBar />);
    expect(screen.getByText('score: 1/2')).toBeInTheDocument();
  });

  it('displays credibility label', () => {
    render(<PointsCredibilityBar />);
    expect(screen.getByText(/credibility/i)).toBeInTheDocument();
  });

  it('renders credibility progress bar with default value', () => {
    // 3 out of 5 = 60%
    currentMockState.credibility = 3;
    currentMockState.initialCredibility = 5;
    render(<PointsCredibilityBar />);
    const progressBar = screen.getByText(/credibility/i).nextElementSibling?.querySelector('div');
    expect(progressBar).toHaveStyle({ width: '60%' });
  });

  it('handles safety fallback', () => {
    currentMockState.credibility = 0;
    currentMockState.initialCredibility = 0;

    render(<PointsCredibilityBar />);
    const progressBar = screen.getByText(/credibility/i).nextElementSibling?.querySelector('div');
    expect(progressBar).toHaveStyle({ width: '0%' });
  });

  it('renders credibility progress bar with custom value', () => {
    render(<PointsCredibilityBar />);
    const progressBar = screen.getByText(/credibility/i).nextElementSibling?.querySelector('div');
    expect(progressBar).toHaveStyle({ width: '60%' });
  });

  it('has correct positioning classes', () => {
    render(<PointsCredibilityBar />);
    const container = screen.getByText(/score/i).closest('div.fixed');
    expect(container).toHaveClass('fixed', 'top-14', 'left-0', 'right-0', 'z-40');
  });

  it('displays score and credibility correctly together', () => {
    const game = createGameStore({ correctAnswers: 1 });
    game.getState().incrCorrectAnswers();
    currentMockState.credibility = 4;
    currentMockState.initialCredibility = 5;
    render(<PointsCredibilityBar />);
    expect(screen.getByText('score: 2/2')).toBeInTheDocument();
    expect(screen.getByText(/credibility/i)).toBeInTheDocument();

    const progressBar = screen.getByText(/credibility/i).nextElementSibling?.querySelector('div');
    expect(progressBar).toHaveStyle({ width: '80%' });
  });
});

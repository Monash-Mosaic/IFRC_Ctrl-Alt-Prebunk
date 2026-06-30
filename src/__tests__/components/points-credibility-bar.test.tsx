import { render, screen } from '@/test-utils/test-utils';
import PointsCredibilityBar from '@/components/points-credibility-bar';

// Create a shared state object that can be modified
const createMockState = () => ({
  points: 0,
  credibility: 3,
  initialCredibility: 5,
  earnedBadges: [] as number[],
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

// Re-import to get the mocked version
const { useCredibilityStore } = require('@/lib/use-credibility-store');

describe('PointsCredibilityBar', () => {
  beforeEach(() => {
    // Reset to default values before each test
    currentMockState = createMockState();
    // Update the mock implementation to use the new state
    (useCredibilityStore as jest.Mock).mockImplementation((selector) => {
      if (selector) {
        return selector(currentMockState);
      }
      return currentMockState;
    });
    jest.clearAllMocks();
  });

  it('renders the component', () => {
    render(<PointsCredibilityBar />);
    expect(screen.getByText(/points/i)).toBeInTheDocument();
  });

  it('displays default points value', () => {
    render(<PointsCredibilityBar />);
    // Translation returns the key, so we check for "points"
    expect(screen.getByText(/points/i)).toBeInTheDocument();
    // Check that the component renders with default value (0 appears in the span)
    const pointsSpan = screen.getByText(/points/i).parentElement;
    expect(pointsSpan?.textContent).toContain('0');
  });

  it('displays custom points value', () => {
    currentMockState.points = 150;
    render(<PointsCredibilityBar />);
    expect(screen.getByText(/150/)).toBeInTheDocument();
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

  it('renders three badge container circles with correct accessibility titles', () => {
      render(<PointsCredibilityBar />);
      
      expect(screen.getByTitle('Misinformation Fighter')).toBeInTheDocument();
      expect(screen.getByTitle('Prebunking Hero')).toBeInTheDocument();
      expect(screen.getByTitle('Prebunking Champion')).toBeInTheDocument();

      const badges = screen
        .getByText(/points/i)
        .closest('div')
        ?.querySelectorAll('div.w-5.h-5.rounded-full');
      expect(badges).toHaveLength(3);
    });

  it('has correct positioning classes', () => {
    render(<PointsCredibilityBar />);
    const container = screen.getByText(/points/i).closest('div.fixed');
    expect(container).toHaveClass('fixed', 'top-14', 'left-0', 'right-0', 'z-40');
  });

  it('displays points and credibility correctly together', () => {
    currentMockState.points = 250;
    currentMockState.credibility = 4;
    currentMockState.initialCredibility = 5;
    render(<PointsCredibilityBar />);
    expect(screen.getByText(/250/)).toBeInTheDocument();
    expect(screen.getByText(/credibility/i)).toBeInTheDocument();

    const progressBar = screen.getByText(/credibility/i).nextElementSibling?.querySelector('div');
    expect(progressBar).toHaveStyle({ width: '80%' });
  });
});

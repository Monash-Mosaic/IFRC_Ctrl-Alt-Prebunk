import { render, screen } from "@/test-utils/test-utils";
import PointsCredibilityBar from "@/components/points-credibility-bar";

// Create a shared state object that can be modified
const createMockState = () => ({
  point: 0,
  credibility: 80,
  setPoint: jest.fn(),
  setCredibility: jest.fn(),
});

// Store state in a way that's accessible to both mock and tests
let currentMockState = createMockState();

// Mock the store
jest.mock("@/lib/use-credibility-store", () => ({
  useCredibilityStore: jest.fn((selector) => {
    if (selector) {
      return selector(currentMockState);
    }
    return currentMockState;
  }),
}));

// Re-import to get the mocked version
const { useCredibilityStore } = require("@/lib/use-credibility-store");

describe("PointsCredibilityBar", () => {
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

  it("renders the component", () => {
    render(<PointsCredibilityBar />);
    expect(screen.getByText(/points/i)).toBeInTheDocument();
  });

  it("displays default points value", () => {
    render(<PointsCredibilityBar />);
    // Translation returns the key, so we check for "points" 
    expect(screen.getByText(/points/i)).toBeInTheDocument();
    // Check that the component renders with default value (0 appears in the span)
    const pointsSpan = screen.getByText(/points/i).parentElement;
    expect(pointsSpan?.textContent).toContain("0");
  });

  it("displays custom points value", () => {
    currentMockState.point = 150;
    render(<PointsCredibilityBar />);
    expect(screen.getByText(/150/)).toBeInTheDocument();
  });

  it("displays credibility label", () => {
    render(<PointsCredibilityBar />);
    expect(screen.getByText(/credibility/i)).toBeInTheDocument();
  });

  it("renders credibility progress bar with default value", () => {
    render(<PointsCredibilityBar />);
    const progressBar = screen
      .getByText(/credibility/i)
      .nextElementSibling?.querySelector("div");
    expect(progressBar).toHaveStyle({ width: "80%" });
  });

  it("renders credibility progress bar with custom value", () => {
    currentMockState.credibility = 65;
    render(<PointsCredibilityBar />);
    const progressBar = screen
      .getByText(/credibility/i)
      .nextElementSibling?.querySelector("div");
    expect(progressBar).toHaveStyle({ width: "65%" });
  });

  it("renders badge circles", () => {
    render(<PointsCredibilityBar />);
    const badges = screen
      .getByText(/points/i)
      .closest("div")?.querySelectorAll("div.h-5.w-5.rounded-full");
    expect(badges).toHaveLength(3);
  });

  it("has correct positioning classes", () => {
    render(<PointsCredibilityBar />);
    const container = screen.getByText(/points/i).closest("div.fixed");
    expect(container).toHaveClass(
      "fixed",
      "top-14",
      "left-0",
      "right-0",
      "z-40"
    );
  });

  it("displays points and credibility correctly together", () => {
    currentMockState.point = 250;
    currentMockState.credibility = 90;
    render(<PointsCredibilityBar />);
    expect(screen.getByText(/250/)).toBeInTheDocument();
    expect(screen.getByText(/credibility/i)).toBeInTheDocument();
    
    const progressBar = screen
      .getByText(/credibility/i)
      .nextElementSibling?.querySelector("div");
    expect(progressBar).toHaveStyle({ width: "90%" });
  });
});

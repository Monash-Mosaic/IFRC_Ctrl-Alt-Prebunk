import { render, screen } from "@/test-utils/test-utils";
import PointsCredibilityBar from "@/components/PointsCredibilityBar";

describe("PointsCredibilityBar", () => {
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
    render(<PointsCredibilityBar points={150} />);
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
    render(<PointsCredibilityBar credibility={65} />);
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

  it("renders slider indicator with correct position", () => {
    render(<PointsCredibilityBar credibility={75} />);
    const credibilityContainer = screen.getByText(/credibility/i).closest("div");
    const progressContainer = credibilityContainer?.querySelector("div.relative");
    const slider = progressContainer?.querySelectorAll("div")[1];
    expect(slider).toHaveStyle({ left: "calc(75% - 10px)" });
  });

  it("displays points and credibility correctly together", () => {
    render(<PointsCredibilityBar points={250} credibility={90} />);
    expect(screen.getByText(/250/)).toBeInTheDocument();
    expect(screen.getByText(/credibility/i)).toBeInTheDocument();
    
    const progressBar = screen
      .getByText(/credibility/i)
      .nextElementSibling?.querySelector("div");
    expect(progressBar).toHaveStyle({ width: "90%" });
  });
});

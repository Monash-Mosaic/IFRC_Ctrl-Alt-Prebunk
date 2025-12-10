import { render, screen } from "@/test-utils/test-utils";
import userEvent from "@testing-library/user-event";
import OptionButton from "./OptionButton";

const translations: Record<string, string> = {
  clickMe: "Click me",
  "step1.option1": "Let's do this! I'm ready.",
};

describe("OptionButton", () => {
  const mockOnClick = jest.fn();
  const mockT = jest.fn((key: string) => translations[key] ?? key);

  beforeEach(() => {
    mockOnClick.mockClear();
    mockT.mockClear();
  });

  it("renders the button with text", () => {
    render(
      <OptionButton
        id="test-button"
        text="Click me"
        translationKey="clickMe"
        onClick={mockOnClick}
        t={mockT}
      />
    );

    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    render(
      <OptionButton
        id="test-button"
        text="Click me"
        translationKey="clickMe"
        onClick={mockOnClick}
        t={mockT}
      />
    );

    const button = screen.getByRole("button", { name: "Click me" });
    await user.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("displays emoji when provided", () => {
    render(
      <OptionButton
        id="test-button"
        text="Click me"
        translationKey="clickMe"
        emoji="🎮"
        onClick={mockOnClick}
        t={mockT}
      />
    );

    expect(screen.getByText("🎮")).toBeInTheDocument();
  });

  it("does not display emoji when not provided", () => {
    render(
      <OptionButton
        id="test-button"
        text="Click me"
        translationKey="clickMe"
        onClick={mockOnClick}
        t={mockT}
      />
    );

    const emoji = screen.queryByText(/🎮|🚀|😌/);
    expect(emoji).not.toBeInTheDocument();
  });

  it("is disabled when disabled prop is true", () => {
    render(
      <OptionButton
        id="test-button"
        text="Click me"
        translationKey="clickMe"
        onClick={mockOnClick}
        disabled={true}
        t={mockT}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("is enabled by default", () => {
    render(
      <OptionButton
        id="test-button"
        text="Click me"
        translationKey="clickMe"
        onClick={mockOnClick}
        t={mockT}
      />
    );

    const button = screen.getByRole("button");
    expect(button).not.toBeDisabled();
  });

  it("does not call onClick when disabled", async () => {
    const user = userEvent.setup();
    render(
      <OptionButton
        id="test-button"
        text="Click me"
        translationKey="clickMe"
        onClick={mockOnClick}
        disabled={true}
        t={mockT}
      />
    );

    const button = screen.getByRole("button");
    await user.click(button);

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it("has correct id attribute", () => {
    render(
      <OptionButton
        id="test-button"
        text="Click me"
        translationKey="clickMe"
        onClick={mockOnClick}
        t={mockT}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("id", "test-button");
  });

  it("has aria-label for accessibility", () => {
    render(
      <OptionButton
        id="test-button"
        text="Click me"
        translationKey="clickMe"
        onClick={mockOnClick}
        t={mockT}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label");
  });

  it("applies disabled styling when disabled", () => {
    const { container } = render(
      <OptionButton
        id="test-button"
        text="Click me"
        translationKey="clickMe"
        onClick={mockOnClick}
        disabled={true}
        t={mockT}
      />
    );

    const button = container.querySelector("button");
    expect(button).toHaveClass("disabled:cursor-not-allowed", "disabled:opacity-50");
  });

  it("handles translation keys correctly", () => {
    mockT.mockReturnValue("Translated Option");
    render(
      <OptionButton
        id="test-button"
        text="step1.option1"
        translationKey="step1.option1"
        onClick={mockOnClick}
        t={mockT}
      />
    );

    // Translation should be attempted
    expect(mockT).toHaveBeenCalledWith("step1.option1");
    expect(screen.getByText("Translated Option")).toBeInTheDocument();
  });
});









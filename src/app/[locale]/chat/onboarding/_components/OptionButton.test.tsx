import { render, screen } from "@/test-utils/test-utils";
import userEvent from "@testing-library/user-event";
import OptionButton from "./OptionButton";

describe("OptionButton", () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it("renders the button with text", () => {
    render(
      <OptionButton
        id="test-button"
        displayText="Click me"
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    render(
      <OptionButton
        id="test-button"
        displayText="Click me"
        onClick={mockOnClick}
      />
    );

    const button = screen.getByRole("button", { name: "Click me" });
    await user.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("displays text content correctly", () => {
    render(
      <OptionButton
        id="test-button"
        displayText="🎮 Let's play"
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText("🎮 Let's play")).toBeInTheDocument();
  });

  it("renders button with correct id attribute", () => {
    render(
      <OptionButton
        id="test-button"
        displayText="Click me"
        onClick={mockOnClick}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("id", "test-button");
  });

  it("has aria-label for accessibility", () => {
    render(
      <OptionButton
        id="test-button"
        displayText="Click me"
        onClick={mockOnClick}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Click me");
  });

  it("is disabled when disabled prop is true", () => {
    render(
      <OptionButton
        id="test-button"
        displayText="Click me"
        onClick={mockOnClick}
        disabled={true}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("is enabled by default", () => {
    render(
      <OptionButton
        id="test-button"
        displayText="Click me"
        onClick={mockOnClick}
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
        displayText="Click me"
        onClick={mockOnClick}
        disabled={true}
      />
    );

    const button = screen.getByRole("button");
    await user.click(button);

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it("applies disabled styling when disabled", () => {
    const { container } = render(
      <OptionButton
        id="test-button"
        displayText="Click me"
        onClick={mockOnClick}
        disabled={true}
      />
    );

    const button = container.querySelector("button");
    expect(button).toHaveClass("disabled:cursor-not-allowed", "disabled:opacity-50");
  });

  it("applies correct styling classes", () => {
    const { container } = render(
      <OptionButton
        id="test-button"
        displayText="Click me"
        onClick={mockOnClick}
      />
    );

    const button = container.querySelector("button");
    expect(button).toHaveClass(
      "rounded-lg",
      "border-2",
      "border-dashed",
      "bg-[#F5F5F5]"
    );
  });
});

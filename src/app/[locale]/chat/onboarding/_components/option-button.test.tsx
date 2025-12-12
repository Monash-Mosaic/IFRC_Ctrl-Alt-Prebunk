import { render, screen } from "@/test-utils/test-utils";
import userEvent from "@testing-library/user-event";
import OptionButton from "./option-button";

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

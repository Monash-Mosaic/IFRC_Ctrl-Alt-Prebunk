import { render, screen } from "@/test-utils/test-utils";
import TextMessage from "./TextMessage";

describe("TextMessage", () => {
  const defaultProps = {
    isUser: false,
    senderName: "Paula",
    displayText: "Hello, this is a test message",
  };

  it("renders the message text", () => {
    render(<TextMessage {...defaultProps} />);

    expect(screen.getByText("Hello, this is a test message")).toBeInTheDocument();
  });

  it("renders sender name for non-user messages", () => {
    render(<TextMessage {...defaultProps} />);

    expect(screen.getByText("Paula")).toBeInTheDocument();
  });

  it("does not render sender name for user messages", () => {
    render(<TextMessage {...defaultProps} isUser={true} />);

    expect(screen.queryByText("Paula")).not.toBeInTheDocument();
  });

  it("renders avatar for non-user messages when provided", () => {
    const mockAvatar = <div data-testid="sender-avatar">Avatar</div>;
    render(<TextMessage {...defaultProps} senderAvatar={mockAvatar} />);

    expect(screen.getByTestId("sender-avatar")).toBeInTheDocument();
  });

  it("does not render avatar for user messages even when provided", () => {
    const mockAvatar = <div data-testid="sender-avatar">Avatar</div>;
    render(
      <TextMessage
        {...defaultProps}
        isUser={true}
        senderAvatar={mockAvatar}
      />
    );

    expect(screen.queryByTestId("sender-avatar")).not.toBeInTheDocument();
  });

  it("does not render avatar when not provided", () => {
    render(<TextMessage {...defaultProps} />);

    expect(screen.queryByTestId("sender-avatar")).not.toBeInTheDocument();
  });

  it("applies correct alignment classes for user messages", () => {
    const { container } = render(<TextMessage {...defaultProps} isUser={true} />);

    const messageContainer = container.querySelector(".flex.w-full.gap-3");
    expect(messageContainer).toHaveClass("justify-end");
    expect(messageContainer).not.toHaveClass("justify-start");
  });

  it("applies correct alignment classes for non-user messages", () => {
    const { container } = render(<TextMessage {...defaultProps} />);

    const messageContainer = container.querySelector(".flex.w-full.gap-3");
    expect(messageContainer).toHaveClass("justify-start");
    expect(messageContainer).not.toHaveClass("justify-end");
  });

  it("applies correct styling classes for user messages", () => {
    const { container } = render(<TextMessage {...defaultProps} isUser={true} />);

    const messageBubble = container.querySelector(".px-4.py-3");
    expect(messageBubble).toHaveClass(
      "rounded-l-2xl",
      "rounded-tr-2xl",
      "bg-[#2FE89F]",
      "text-white"
    );
  });

  it("applies correct styling classes for non-user messages", () => {
    const { container } = render(<TextMessage {...defaultProps} />);

    const messageBubble = container.querySelector(".px-4.py-3");
    expect(messageBubble).toHaveClass(
      "rounded-r-2xl",
      "rounded-tl-2xl",
      "border",
      "border-[#0D1B3E]/20",
      "bg-white",
      "text-[#0D1B3E]"
    );
  });

  it("preserves whitespace in message text", () => {
    const multiLineText = "Line 1\nLine 2\nLine 3";
    const { container } = render(<TextMessage {...defaultProps} displayText={multiLineText} />);

    const messageText = container.querySelector("p.whitespace-pre-wrap");
    expect(messageText).toBeInTheDocument();
    expect(messageText).toHaveClass("whitespace-pre-wrap");
    expect(messageText?.textContent).toBe(multiLineText);
  });

  it("handles empty message text", () => {
    const { container } = render(<TextMessage {...defaultProps} displayText="" />);

    const messageText = container.querySelector("p.whitespace-pre-wrap");
    expect(messageText).toBeInTheDocument();
    expect(messageText?.textContent).toBe("");
  });

  it("handles long message text", () => {
    const longText = "A".repeat(500);
    render(<TextMessage {...defaultProps} displayText={longText} />);

    expect(screen.getByText(longText)).toBeInTheDocument();
  });

  it("renders with custom sender name", () => {
    render(<TextMessage {...defaultProps} senderName="Custom Sender" />);

    expect(screen.getByText("Custom Sender")).toBeInTheDocument();
  });
});

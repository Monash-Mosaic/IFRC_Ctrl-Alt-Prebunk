import { render, screen } from "@/test-utils/test-utils";
import userEvent from "@testing-library/user-event";
import PostMessage from "./PostMessage";

// Mock EchoAvatar
jest.mock("../_icons/EchoAvatar", () => {
  return function MockEchoAvatar() {
    return <div data-testid="echo-avatar">Echo Avatar</div>;
  };
});

describe("PostMessage", () => {
  const defaultProps = {
    text: "So much for 'global warming'! Record freezing temperatures in rural Victoria today.",
    hashtags: ["#ClimateHoax", "#GlobalWarming"],
  };

  it("renders the post with default props", () => {
    render(<PostMessage {...defaultProps} />);

    expect(screen.getByText("Echo")).toBeInTheDocument();
    expect(screen.getByText("@climate_truth_warrior")).toBeInTheDocument();
    expect(screen.getByText(defaultProps.text)).toBeInTheDocument();
  });

  it("renders custom name and handle", () => {
    render(
      <PostMessage
        {...defaultProps}
        name="Custom Name"
        handle="@custom_handle"
      />
    );

    expect(screen.getByText("Custom Name")).toBeInTheDocument();
    expect(screen.getByText("@custom_handle")).toBeInTheDocument();
  });

  it("renders hashtags", () => {
    render(<PostMessage {...defaultProps} />);

    defaultProps.hashtags.forEach((tag) => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  it("renders media when mediaUrl is provided", () => {
    const { container } = render(
      <PostMessage {...defaultProps} mediaUrl="/test-image.jpg" mediaType="image" />
    );

    const mediaContainer = container.querySelector(".aspect-video");
    expect(mediaContainer).toBeInTheDocument();
  });

  it("renders video play button when mediaType is video", () => {
    const { container } = render(
      <PostMessage
        {...defaultProps}
        mediaUrl="/test-video.mp4"
        mediaType="video"
      />
    );

    const playButton = container.querySelector(".rounded-full");
    expect(playButton).toBeInTheDocument();
  });

  it("calls onLike when like button is clicked", async () => {
    const mockOnLike = jest.fn();
    const user = userEvent.setup();
    render(<PostMessage {...defaultProps} onLike={mockOnLike} />);

    const likeButton = screen.getByLabelText("Like");
    await user.click(likeButton);

    expect(mockOnLike).toHaveBeenCalledTimes(1);
  });

  it("calls onDislike when dislike button is clicked", async () => {
    const mockOnDislike = jest.fn();
    const user = userEvent.setup();
    render(<PostMessage {...defaultProps} onDislike={mockOnDislike} />);

    const dislikeButton = screen.getByLabelText("Dislike");
    await user.click(dislikeButton);

    expect(mockOnDislike).toHaveBeenCalledTimes(1);
  });

  it("calls onComment when comment button is clicked", async () => {
    const mockOnComment = jest.fn();
    const user = userEvent.setup();
    render(<PostMessage {...defaultProps} onComment={mockOnComment} />);

    const commentButton = screen.getByLabelText("Comment");
    await user.click(commentButton);

    expect(mockOnComment).toHaveBeenCalledTimes(1);
  });

  it("calls onShare when share button is clicked", async () => {
    const mockOnShare = jest.fn();
    const user = userEvent.setup();
    render(<PostMessage {...defaultProps} onShare={mockOnShare} />);

    const shareButton = screen.getByLabelText("Share");
    await user.click(shareButton);

    expect(mockOnShare).toHaveBeenCalledTimes(1);
  });

  it("renders all interaction buttons", () => {
    render(<PostMessage {...defaultProps} />);

    expect(screen.getByLabelText("Like")).toBeInTheDocument();
    expect(screen.getByLabelText("Dislike")).toBeInTheDocument();
    expect(screen.getByLabelText("Comment")).toBeInTheDocument();
    expect(screen.getByLabelText("Share")).toBeInTheDocument();
  });

  it("renders dropdown button", () => {
    render(<PostMessage {...defaultProps} />);

    expect(screen.getByLabelText("More options")).toBeInTheDocument();
  });

  it("renders Echo avatar", () => {
    render(<PostMessage {...defaultProps} />);

    expect(screen.getByTestId("echo-avatar")).toBeInTheDocument();
  });

  it("handles empty hashtags array", () => {
    render(<PostMessage text={defaultProps.text} hashtags={[]} />);

    expect(screen.getByText(defaultProps.text)).toBeInTheDocument();
  });
});




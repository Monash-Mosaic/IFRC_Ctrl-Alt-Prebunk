import { render, screen } from "@/test-utils/test-utils";
import userEvent from "@testing-library/user-event";
import PostMessage from "./PostMessage";

// Mock EchoAvatar
jest.mock("../_icons/EchoAvatar", () => {
  return function MockEchoAvatar() {
    return <div data-testid="echo-avatar">Echo Avatar</div>;
  };
});

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: function Image({ src, alt, ...props }: any) {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img src={src} alt={alt} {...props} />;
  },
}));

describe("PostMessage", () => {
  const defaultContent = (
    <div>
      <p>So much for 'global warming'! Record freezing temperatures in rural Victoria today.</p>
      <p>#ClimateHoax #GlobalWarming</p>
    </div>
  );

  const defaultProps = {
    name: "Echo",
    handle: "@climate_truth_warrior",
    content: defaultContent,
  };

  it("renders the post with default props", () => {
    render(<PostMessage {...defaultProps} />);

    expect(screen.getByText("Echo")).toBeInTheDocument();
    expect(screen.getByText("@climate_truth_warrior")).toBeInTheDocument();
    expect(screen.getByText(/So much for 'global warming'/)).toBeInTheDocument();
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

  it("renders custom content", () => {
    const customContent = <div>Custom post content</div>;
    render(
      <PostMessage
        name="Echo"
        handle="@climate_truth_warrior"
        content={customContent}
      />
    );

    expect(screen.getByText("Custom post content")).toBeInTheDocument();
  });

  it("renders image when mediaUrl and mediaType image are provided", () => {
    render(
      <PostMessage {...defaultProps} mediaUrl="/test-image.jpg" mediaType="image" />
    );

    const image = screen.getByAltText("Echo post");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/test-image.jpg");
  });

  it("renders video icon when mediaType is video", () => {
    const { container } = render(
      <PostMessage
        {...defaultProps}
        mediaUrl="/test-video.mp4"
        mediaType="video"
      />
    );

    const videoIcon = container.querySelector(".lucide-video");
    expect(videoIcon).toBeInTheDocument();
  });

  it("does not render media when mediaUrl is not provided", () => {
    const { container } = render(<PostMessage {...defaultProps} />);

    const mediaContainer = container.querySelector(".aspect-video");
    expect(mediaContainer).not.toBeInTheDocument();
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

  it("renders Echo avatar", () => {
    render(<PostMessage {...defaultProps} />);

    expect(screen.getByTestId("echo-avatar")).toBeInTheDocument();
  });

  it("handles empty content", () => {
    render(
      <PostMessage
        name="Echo"
        handle="@climate_truth_warrior"
        content={<div />}
      />
    );

    expect(screen.getByText("Echo")).toBeInTheDocument();
    expect(screen.getByText("@climate_truth_warrior")).toBeInTheDocument();
  });
});

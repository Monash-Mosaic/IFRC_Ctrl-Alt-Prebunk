import { render, screen, within } from '@/test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import PostMessage from '@/components/post-message';

describe('PostMessage', () => {
  const defaultUser = {
    id: 'echo',
    name: 'Echo',
    handle: '@climate_truth_warrior',
    avatar: <div data-testid="echo-avatar">Echo Avatar</div>,
    isUser: false,
  };

  const defaultProps = {
    user: defaultUser,
    content: <p>Test post content</p>,
  };

  it('renders one article containing the user, avatar, and content', () => {
    render(<PostMessage {...defaultProps} />);

    expect(screen.getAllByRole('article')).toHaveLength(1);
    const article = within(screen.getByRole('article'));
    expect(article.getByRole('heading', { name: 'Echo' })).toBeInTheDocument();
    expect(article.getByText('@climate_truth_warrior')).toBeInTheDocument();
    expect(article.getByTestId('echo-avatar')).toBeInTheDocument();
    expect(article.getByText('Test post content')).toBeInTheDocument();
  });

  it('renders custom user details', () => {
    render(
      <PostMessage
        {...defaultProps}
        user={{ ...defaultUser, name: 'Custom Name', handle: '@custom_handle' }}
      />
    );
    expect(screen.getByRole('heading', { name: 'Custom Name' })).toBeInTheDocument();
    expect(screen.getByText('@custom_handle')).toBeInTheDocument();
  });

  it('handles empty content and missing user details', () => {
    render(
      <PostMessage user={{ ...defaultUser, name: '', handle: '', avatar: null }} content={null} />
    );
    expect(screen.getByRole('article')).toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.queryByText('@climate_truth_warrior')).not.toBeInTheDocument();
  });

  it.each([undefined, 'image'] as const)('renders an image with mediaType %s', (mediaType) => {
    render(<PostMessage {...defaultProps} mediaUrl="/test-image.jpg" mediaType={mediaType} />);
    expect(screen.getByRole('img', { name: 'Echo post' })).toHaveAttribute(
      'src',
      '/test-image.jpg'
    );
  });

  it('uses the supplied media description', () => {
    render(<PostMessage {...defaultProps} mediaUrl="/question.jpg" mediaAlt="Question post" />);
    expect(screen.getByRole('img', { name: 'Question post' })).toHaveAttribute(
      'src',
      '/question.jpg'
    );
  });

  it('keeps the video placeholder', () => {
    const { container } = render(
      <PostMessage {...defaultProps} mediaUrl="/test-video.mp4" mediaType="video" />
    );
    expect(container.querySelector('.lucide-video')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('does not render media without a URL', () => {
    const { container } = render(<PostMessage {...defaultProps} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.querySelector('.aspect-video')).not.toBeInTheDocument();
  });

  it.each([undefined, null])('renders no controls when interaction is %s', (interaction) => {
    render(<PostMessage {...defaultProps} interaction={interaction} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders a working supplied interaction after the content and media', async () => {
    const onClick = jest.fn();
    const user = userEvent.setup();
    render(
      <PostMessage
        {...defaultProps}
        mediaUrl="/test-image.jpg"
        interaction={
          <button type="button" onClick={onClick}>
            Choose an answer
          </button>
        }
      />
    );

    const article = within(screen.getByRole('article'));
    const interaction = article.getByRole('button', { name: 'Choose an answer' });
    const media = article.getByRole('img');
    expect(
      media.compareDocumentPosition(interaction) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    await user.click(interaction);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies presentation classes without deciding whether supplied controls are disabled', async () => {
    const onClick = jest.fn();
    const user = userEvent.setup();
    render(
      <PostMessage
        {...defaultProps}
        className="opacity-50"
        interaction={
          <>
            <button type="button" onClick={onClick}>
              Available option
            </button>
            <button type="button" disabled>
              Unavailable option
            </button>
          </>
        }
      />
    );
    expect(screen.getByRole('article')).toHaveClass('opacity-50');
    expect(screen.getByRole('button', { name: 'Available option' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Unavailable option' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Available option' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

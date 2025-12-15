import { render, screen } from '@/test-utils/test-utils';
import TypingMessage from './typing-message';

describe('TypingMessage', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<TypingMessage />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with sender name', () => {
    const { container } = render(<TypingMessage senderName="Paula" />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with sender avatar', () => {
    const mockAvatar = <div data-testid="sender-avatar">Avatar</div>;
    const { container } = render(<TypingMessage senderAvatar={mockAvatar} />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with both avatar and sender name', () => {
    const mockAvatar = <div data-testid="sender-avatar">Avatar</div>;
    const { container } = render(<TypingMessage senderAvatar={mockAvatar} senderName="Paula" />);
    expect(container).toMatchSnapshot();
  });

  it('renders the typing indicator with three dots', () => {
    const { container } = render(<TypingMessage />);

    const dots = container.querySelectorAll('.animate-bounce.rounded-full');
    expect(dots).toHaveLength(3);
  });

  it('renders sender avatar when provided', () => {
    const mockAvatar = <div data-testid="sender-avatar">Avatar</div>;
    render(<TypingMessage senderAvatar={mockAvatar} />);

    expect(screen.getByTestId('sender-avatar')).toBeInTheDocument();
  });

  it('does not render sender avatar when not provided', () => {
    render(<TypingMessage />);

    expect(screen.queryByTestId('sender-avatar')).not.toBeInTheDocument();
  });

  it('renders sender name when provided', () => {
    render(<TypingMessage senderName="Paula" />);

    expect(screen.getByText('Paula')).toBeInTheDocument();
  });

  it('does not render sender name when not provided', () => {
    render(<TypingMessage />);

    const senderName = screen.queryByText('Paula');
    expect(senderName).not.toBeInTheDocument();
  });

  it('applies correct container styling classes', () => {
    const { container } = render(<TypingMessage />);

    const messageContainer = container.querySelector('.flex.w-full.gap-3');
    expect(messageContainer).toHaveClass('justify-start');
  });

  it('applies correct animation delays to typing dots', () => {
    const { container } = render(<TypingMessage />);

    const dots = container.querySelectorAll('.animate-bounce.rounded-full');
    expect(dots[0]).toHaveClass('[animation-delay:-0.3s]');
    expect(dots[1]).toHaveClass('[animation-delay:-0.15s]');
    expect(dots[2]).not.toHaveClass('[animation-delay:-0.3s]');
    expect(dots[2]).not.toHaveClass('[animation-delay:-0.15s]');
  });
});

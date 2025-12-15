import { render, screen } from '@/test-utils/test-utils';
import BotTextMessage from './bot-text-message';

describe('BotTextMessage', () => {
  const defaultProps = {
    senderName: 'Paula',
    displayText: 'Hello, this is a test message',
  };

  it('renders the message text', () => {
    render(<BotTextMessage {...defaultProps} />);

    expect(screen.getByText('Hello, this is a test message')).toBeInTheDocument();
  });

  it('renders sender name', () => {
    render(<BotTextMessage {...defaultProps} />);

    expect(screen.getByText('Paula')).toBeInTheDocument();
  });

  it('renders avatar when provided', () => {
    const mockAvatar = <div data-testid="sender-avatar">Avatar</div>;
    render(<BotTextMessage {...defaultProps} senderAvatar={mockAvatar} />);

    expect(screen.getByTestId('sender-avatar')).toBeInTheDocument();
  });

  it('does not render avatar when not provided', () => {
    render(<BotTextMessage {...defaultProps} />);

    expect(screen.queryByTestId('sender-avatar')).not.toBeInTheDocument();
  });

  it('applies correct alignment classes', () => {
    const { container } = render(<BotTextMessage {...defaultProps} />);

    const messageContainer = container.querySelector('.flex.w-full.gap-3');
    expect(messageContainer).toHaveClass('justify-start');
    expect(messageContainer).not.toHaveClass('justify-end');
  });

  it('applies correct styling classes', () => {
    const { container } = render(<BotTextMessage {...defaultProps} />);

    const messageBubble = container.querySelector('.px-4.py-3');
    expect(messageBubble).toHaveClass(
      'rounded-r-2xl',
      'rounded-tl-2xl',
      'border',
      'border-[#2979FF]',
      'bg-white',
      'text-black'
    );
  });

  it('preserves whitespace in message text', () => {
    const multiLineText = 'Line 1\nLine 2\nLine 3';
    const { container } = render(<BotTextMessage {...defaultProps} displayText={multiLineText} />);

    const messageText = container.querySelector('p.whitespace-pre-wrap');
    expect(messageText).toBeInTheDocument();
    expect(messageText).toHaveClass('whitespace-pre-wrap');
    expect(messageText?.textContent).toBe(multiLineText);
  });

  it('handles empty message text', () => {
    const { container } = render(<BotTextMessage {...defaultProps} displayText="" />);

    const messageText = container.querySelector('p.whitespace-pre-wrap');
    expect(messageText).toBeInTheDocument();
    expect(messageText?.textContent).toBe('');
  });

  it('handles long message text', () => {
    const longText = 'A'.repeat(500);
    render(<BotTextMessage {...defaultProps} displayText={longText} />);

    expect(screen.getByText(longText)).toBeInTheDocument();
  });

  it('renders with custom sender name', () => {
    render(<BotTextMessage {...defaultProps} senderName="Custom Sender" />);

    expect(screen.getByText('Custom Sender')).toBeInTheDocument();
  });
});

import { render } from '@/test-utils/test-utils';
import BotTextMessage from './bot-text-message';

describe('BotTextMessage', () => {
  const defaultProps = {
    senderName: 'Paula',
    displayText: 'Hello, this is a test message',
  };

  it('matches snapshot with default message', () => {
    const { container } = render(<BotTextMessage {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with avatar', () => {
    const mockAvatar = <div data-testid="sender-avatar">Avatar</div>;
    const { container } = render(<BotTextMessage {...defaultProps} senderAvatar={mockAvatar} />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot without avatar', () => {
    const { container } = render(<BotTextMessage {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with custom sender name', () => {
    const { container } = render(<BotTextMessage {...defaultProps} senderName="Custom Sender" />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with multiline text', () => {
    const multiLineText = 'Line 1\nLine 2\nLine 3';
    const { container } = render(<BotTextMessage {...defaultProps} displayText={multiLineText} />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with empty message', () => {
    const { container } = render(<BotTextMessage {...defaultProps} displayText="" />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with long message', () => {
    const longText = 'A'.repeat(500);
    const { container } = render(<BotTextMessage {...defaultProps} displayText={longText} />);
    expect(container).toMatchSnapshot();
  });
});

import { render, screen } from '@/test-utils/test-utils';
import UserTextMessage from './user-text-message';

describe('UserTextMessage', () => {
  it('matches snapshot with default message', () => {
    const { container } = render(<UserTextMessage displayText="Hello, this is a test message" />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with multiline text', () => {
    const multiLineText = 'Line 1\nLine 2\nLine 3';
    const { container } = render(<UserTextMessage displayText={multiLineText} />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with empty message', () => {
    const { container } = render(<UserTextMessage displayText="" />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with long message', () => {
    const longText = 'A'.repeat(500);
    const { container } = render(<UserTextMessage displayText={longText} />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with special characters', () => {
    const { container } = render(<UserTextMessage displayText="Hello & <world>!" />);
    expect(container).toMatchSnapshot();
  });

  it('renders the message text', () => {
    render(<UserTextMessage displayText="Hello, this is a test message" />);

    expect(screen.getByText('Hello, this is a test message')).toBeInTheDocument();
  });

  it('applies correct alignment classes', () => {
    const { container } = render(<UserTextMessage displayText="Test message" />);

    const messageContainer = container.querySelector('.flex.w-full.gap-3');
    expect(messageContainer).toHaveClass('justify-end');
    expect(messageContainer).not.toHaveClass('justify-start');
  });
});

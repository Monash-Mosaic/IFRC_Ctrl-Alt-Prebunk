import { render, screen } from '@/test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import OptionButton from './option-button';

describe('OptionButton', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('matches snapshot with default props', () => {
    const { container } = render(
      <OptionButton id="test-button" displayText="Click me" onClick={mockOnClick} />
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with emoji text', () => {
    const { container } = render(
      <OptionButton id="test-button" displayText="🎮 Let's play" onClick={mockOnClick} />
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot when disabled', () => {
    const { container } = render(
      <OptionButton id="test-button" displayText="Click me" onClick={mockOnClick} disabled />
    );
    expect(container).toMatchSnapshot();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    render(<OptionButton id="test-button" displayText="Click me" onClick={mockOnClick} />);

    const button = screen.getByRole('button', { name: 'Click me' });
    await user.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('renders button with correct id attribute', () => {
    render(<OptionButton id="test-button" displayText="Click me" onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('id', 'test-button');
  });

  it('has aria-label for accessibility', () => {
    render(<OptionButton id="test-button" displayText="Click me" onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Click me');
  });
});

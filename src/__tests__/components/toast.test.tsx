import React from 'react';
import { render, screen, act } from '@/test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import Toast from '@/components/toast';

describe('Toast', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders nothing when not visible', () => {
    const onClose = jest.fn();
    render(<Toast message="hello" isVisible={false} onClose={onClose} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders the message when visible', () => {
    render(<Toast message="Something went wrong" isVisible={true} onClose={jest.fn()} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    const onClose = jest.fn();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<Toast message="hello" isVisible={true} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Close notification' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose automatically after the default duration', () => {
    const onClose = jest.fn();
    render(<Toast message="auto-close" isVisible={true} onClose={onClose} />);

    act(() => {
      jest.advanceTimersByTime(4000);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose after a custom duration', () => {
    const onClose = jest.fn();
    render(<Toast message="auto-close" isVisible={true} onClose={onClose} duration={1500} />);

    act(() => {
      jest.advanceTimersByTime(1499);
    });
    expect(onClose).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not start the auto-close timer when not visible', () => {
    const onClose = jest.fn();
    render(<Toast message="hidden" isVisible={false} onClose={onClose} />);

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(onClose).not.toHaveBeenCalled();
  });
});

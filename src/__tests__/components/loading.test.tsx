import React from 'react';
import { render, screen } from '@/test-utils/test-utils';
import Loading from '@/components/loading';

describe('Loading', () => {
  it('renders loading status with display text', () => {
    render(<Loading displayText="Loading simulation..." />);

    const status = screen.getByRole('status', { name: 'Loading simulation...' });
    expect(status).toBeInTheDocument();
    expect(screen.getByText('Loading simulation...')).toBeInTheDocument();
  });

  it('renders the spinner element', () => {
    const { container } = render(<Loading displayText="Please wait" />);

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });
});

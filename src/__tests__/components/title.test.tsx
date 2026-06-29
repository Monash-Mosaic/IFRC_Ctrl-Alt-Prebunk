import React from 'react';
import { render } from '@/test-utils/test-utils';
import Title from '@/components/title';

describe('Title', () => {
  it('renders with default dimensions', () => {
    const { container } = render(<Title />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('width', '573');
    expect(svg).toHaveAttribute('height', '71');
  });

  it('renders with custom dimensions and className', () => {
    const { container } = render(<Title width="100%" height={40} className="max-w-full" />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('width', '100%');
    expect(svg).toHaveAttribute('height', '40');
    expect(svg).toHaveClass('max-w-full');
  });
});

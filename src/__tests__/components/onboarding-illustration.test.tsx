import React from 'react';
import { render } from '@/test-utils/test-utils';
import Illustration from '@/components/icons/onboarding-illustration';

describe('OnboardingIllustration', () => {
  it('renders with default props', () => {
    const { container } = render(<Illustration />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('width', '408');
    expect(svg).toHaveAttribute('height', '423');
    expect(svg).toHaveAttribute('fill', 'none');
  });

  it('renders with custom dimensions and fill', () => {
    const { container } = render(<Illustration width="100%" height={200} fill="#fff" />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('width', '100%');
    expect(svg).toHaveAttribute('height', '200');
    expect(svg).toHaveAttribute('fill', '#fff');
  });
});

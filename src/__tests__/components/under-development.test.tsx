import React from 'react';
import { render, screen } from '@/test-utils/test-utils';
import UnderDevelopment from '@/components/under-development';

describe('UnderDevelopment', () => {
  it('renders title and message', () => {
    render(<UnderDevelopment title="Coming soon" message="This page is under development." />);

    expect(screen.getByRole('heading', { name: 'Coming soon' })).toBeInTheDocument();
    expect(screen.getByText('This page is under development.')).toBeInTheDocument();
  });

  it('renders the development icon', () => {
    const { container } = render(
      <UnderDevelopment title="Profile" message="Work in progress" />,
    );

    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});

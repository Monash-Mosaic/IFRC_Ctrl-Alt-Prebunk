import React from 'react';
import { render, screen } from '@/test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import { Button, buttonVariants } from '@/components/ui/button';

describe('Button', () => {
  it('renders a button with default variant and size', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toHaveAttribute('data-slot', 'button');
    expect(button).toHaveAttribute('data-variant', 'default');
    expect(button).toHaveAttribute('data-size', 'default');
  });

  it.each([
    ['destructive', 'destructive'],
    ['outline', 'outline'],
    ['secondary', 'secondary'],
    ['ghost', 'ghost'],
    ['link', 'link'],
  ] as const)('renders the %s variant', (variant) => {
    render(<Button variant={variant}>Variant</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', variant);
  });

  it.each([
    ['sm', 'sm'],
    ['lg', 'lg'],
    ['icon', 'icon'],
    ['icon-sm', 'icon-sm'],
    ['icon-lg', 'icon-lg'],
  ] as const)('renders the %s size', (size) => {
    render(<Button size={size}>Sized</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', size);
  });

  it('handles click events', async () => {
    const onClick = jest.fn();
    const user = userEvent.setup();

    render(<Button onClick={onClick}>Press</Button>);
    await user.click(screen.getByRole('button', { name: 'Press' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders as child element when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link button</a>
      </Button>,
    );

    const link = screen.getByRole('link', { name: 'Link button' });
    expect(link).toHaveAttribute('data-slot', 'button');
    expect(link).toHaveAttribute('href', '/test');
  });

  it('exports buttonVariants helper', () => {
    expect(buttonVariants({ variant: 'outline', size: 'sm' })).toContain('border');
  });
});

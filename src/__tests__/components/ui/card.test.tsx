import React from 'react';
import { render, screen } from '@/test-utils/test-utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

describe('Card components', () => {
  it('renders all card subcomponents', () => {
    render(
      <Card data-testid="card">
        <CardHeader data-testid="card-header">
          <CardTitle>Card title</CardTitle>
          <CardDescription>Card description</CardDescription>
          <CardAction>
            <button type="button">Action</button>
          </CardAction>
        </CardHeader>
        <CardContent>Main content</CardContent>
        <CardFooter>Footer content</CardFooter>
      </Card>,
    );

    expect(screen.getByTestId('card')).toHaveAttribute('data-slot', 'card');
    expect(screen.getByTestId('card-header')).toHaveAttribute('data-slot', 'card-header');
    expect(screen.getByText('Card title')).toHaveAttribute('data-slot', 'card-title');
    expect(screen.getByText('Card description')).toHaveAttribute('data-slot', 'card-description');
    expect(screen.getByRole('button', { name: 'Action' }).parentElement).toHaveAttribute(
      'data-slot',
      'card-action',
    );
    expect(screen.getByText('Main content')).toHaveAttribute('data-slot', 'card-content');
    expect(screen.getByText('Footer content')).toHaveAttribute('data-slot', 'card-footer');
  });

  it('applies custom class names', () => {
    render(
      <Card className="custom-card">
        <CardContent className="custom-content">Styled</CardContent>
      </Card>,
    );

    expect(screen.getByText('Styled')).toHaveClass('custom-content');
    expect(screen.getByText('Styled').closest('[data-slot="card"]')).toHaveClass('custom-card');
  });
});

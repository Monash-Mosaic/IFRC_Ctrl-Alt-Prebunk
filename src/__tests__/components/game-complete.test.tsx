import React from 'react';
import { render, screen } from '@/test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import GameComplete from '@/components/game-complete';

describe('GameComplete', () => {
  it('displays the score and champion message', () => {
    render(
      <GameComplete correctAnswers={3} totalQuestions={5} restartGame={jest.fn()} />,
    );

    expect(screen.getByText('Simulation complete!')).toBeInTheDocument();
    expect(screen.getByText('3/5')).toBeInTheDocument();
    expect(screen.getByText('Prebunking Champion')).toBeInTheDocument();
  });

  it('renders external resource links', () => {
    render(
      <GameComplete correctAnswers={1} totalQuestions={1} restartGame={jest.fn()} />,
    );

    expect(screen.getByRole('link', { name: 'Read the World Disasters Report' })).toHaveAttribute(
      'href',
      'https://wdr26.org/en',
    );
    expect(
      screen.getByRole('link', { name: 'Learn about Solferino Academy' }),
    ).toHaveAttribute('href', 'https://solferinoacademy.com/');
  });

  it('calls restartGame when restart button is clicked', async () => {
    const restartGame = jest.fn();
    const user = userEvent.setup();

    render(
      <GameComplete correctAnswers={2} totalQuestions={4} restartGame={restartGame} />,
    );

    await user.click(screen.getByRole('button', { name: 'Restart simulation' }));
    expect(restartGame).toHaveBeenCalledTimes(1);
  });
});

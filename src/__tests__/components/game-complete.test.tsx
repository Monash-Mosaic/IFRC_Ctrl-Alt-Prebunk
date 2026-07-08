import React from 'react';
import { render, screen } from '@/test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import GameComplete, {OUTCOME_LABELS, OUTCOME_MESSAGES} from '@/components/game-complete';

describe('GameComplete', () => {
  it('displays the score and champion message', () => {
    render(
      <GameComplete correctAnswers={5} totalQuestions={5} restartGame={jest.fn()} />,
    );

    expect(screen.getByText('Simulation complete!')).toBeInTheDocument();
    expect(screen.getByText('5/5')).toBeInTheDocument();
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

  it('displays the correct outcome label and message for different scores', () => {
    const scoreCases = Array.from({ length: 11 }, (_, index) => ({
      correctAnswers: index,
      totalQuestions: 10,
      expectedLabel: OUTCOME_LABELS[Math.floor(index / 2)],
      expectedMessage: OUTCOME_MESSAGES[Math.floor(index / 2)],
    }));

    scoreCases.forEach(({ correctAnswers, totalQuestions, expectedLabel, expectedMessage }) => {
      const { unmount } = render(
        <GameComplete
          correctAnswers={correctAnswers}
          totalQuestions={totalQuestions}
          restartGame={jest.fn()}
        />,
      );

      expect(screen.getByText(expectedLabel)).toBeInTheDocument();
      expect(screen.getByText(expectedMessage)).toBeInTheDocument();

      unmount();
    });
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

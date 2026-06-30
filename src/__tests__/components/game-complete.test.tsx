import React from 'react';
import { render, screen } from '@/test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import GameComplete from '@/components/game-complete';

const mockToPng = jest.fn();

jest.mock('html-to-image', () => ({
  toPng: (...args: any[]) => mockToPng(...args),
}));

jest.mock('react-modal', () => {
  const React = require('react');
  const Modal = ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) =>
    isOpen ? <div data-testid="react-modal">{children}</div> : null;
  Modal.setAppElement = jest.fn();
  return {
    __esModule: true,
    default: Modal,
  };
});

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

  it('opens and renders ShareProgressModal when Share Progress is clicked', async () => {

    const user = userEvent.setup();
    render(<GameComplete correctAnswers={2} totalQuestions={2} restartGame={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: /share my progress/i }));

    expect(await screen.findByText('Share your progress')).toBeInTheDocument();
    expect(screen.getByText(/Download a snapshot of your results to share/i)).toBeInTheDocument();
  });

  it('downloads image when Download Image is clicked', async () => {
    mockToPng.mockResolvedValue('data:image/png;base64,123');

    const user = userEvent.setup();
    render(<GameComplete correctAnswers={2} totalQuestions={2} restartGame={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: /share my progress/i }));
    await user.click(await screen.findByRole('button', { name: /download image/i }));

    expect(mockToPng).toHaveBeenCalled();
  });
});

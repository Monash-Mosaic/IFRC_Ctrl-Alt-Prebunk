import React from 'react';
import { render, screen } from '@/test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import GameComplete, {OUTCOME_LABELS, OUTCOME_MESSAGES} from '@/components/game-complete';
import { useCredibilityStore } from '@/lib/use-credibility-store';

const mockToPng = jest.fn();
const mockToBlob = jest.fn();

jest.mock('html-to-image', () => ({
  toPng: (...args: any[]) => mockToPng(...args),
  toBlob: (...args: any[]) => mockToBlob(...args),
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

  it('shows the final credibility from the game store', () => {
    const originalCredibility = useCredibilityStore.getState();
    useCredibilityStore.setState({ credibility: 0, initialCredibility: 3 });

    try {
      render(<GameComplete correctAnswers={2} totalQuestions={7} restartGame={jest.fn()} />);

      const meter = screen.getByRole('meter', { name: 'Final credibility' });
      expect(meter).toHaveAttribute('value', '0');
      expect(meter).toHaveAttribute('max', '3');
      expect(screen.queryByText('0/3')).not.toBeInTheDocument();
    } finally {
      useCredibilityStore.setState(originalCredibility);
    }
  });

  it('opens and closes photo credits with the seven source links', async () => {
    const user = userEvent.setup();
    render(<GameComplete correctAnswers={2} totalQuestions={7} restartGame={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Photo credits' }));

    expect(screen.getByRole('heading', { name: 'Photo credits' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(7);
    expect(screen.getByRole('link', { name: 'IFRC' })).toHaveAttribute(
      'href',
      'https://www.ifrc.org/article/el-nino-what-it-and-what-does-it-mean-disasters'
    );
    expect(screen.getByRole('link', { name: 'Open Peeps' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('heading', { name: 'Photo credits' })).not.toBeInTheDocument();
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

  it('opens and renders ShareProgressModal when Share Progress is clicked', async () => {

    const user = userEvent.setup();
    render(<GameComplete correctAnswers={2} totalQuestions={2} restartGame={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: /share my progress/i }));

    expect(await screen.findByText('Share your progress')).toBeInTheDocument();
    expect(screen.getByText(/Share or download a snapshot of your results/i)).toBeInTheDocument();
  });

  it('downloads image when Download is clicked', async () => {
    mockToPng.mockResolvedValue('data:image/png;base64,123');

    const user = userEvent.setup();
    render(<GameComplete correctAnswers={2} totalQuestions={2} restartGame={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: /share my progress/i }));
    await user.click(await screen.findByRole('button', { name: /download/i }));

    expect(mockToPng).toHaveBeenCalled();
  });

  it('shares image when Share is clicked', async () => {
    const shareMock = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: shareMock,
    });
    Object.defineProperty(navigator, 'canShare', {
      configurable: true,
      value: jest.fn(() => true),
    });
    mockToBlob.mockResolvedValue(new Blob(['image'], { type: 'image/png' }));

    const user = userEvent.setup();
    render(<GameComplete correctAnswers={2} totalQuestions={2} restartGame={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: /share my progress/i }));
    await user.click(await screen.findByRole('button', { name: /^share$/i }));

    expect(mockToBlob).toHaveBeenCalled();
    expect(shareMock).toHaveBeenCalled();
  });
});

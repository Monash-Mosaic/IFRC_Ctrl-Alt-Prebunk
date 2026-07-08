import { render, screen } from '@/test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import SimulationResult, { getSimulationOutcome } from './simulation-result';

describe('SimulationResult', () => {
  it.each([
    [0, 'Prebunking Emerging'],
    [1, 'Prebunking Beginner'],
    [2, 'Prebunking Novice'],
    [3, 'Prebunker'],
    [4, 'Prebunking Proficient'],
    [5, 'Prebunking Champion'],
  ])('returns the correct outcome for %i out of 5', (correctAnswers, expectedLabel) => {
    expect(getSimulationOutcome(correctAnswers, 5).label).toBe(expectedLabel);
  });

  it('renders the score and outcome label', () => {
    render(<SimulationResult correctAnswers={5} totalQuestions={5} onRestart={jest.fn()} />);

    expect(screen.getByText('Simulation complete!')).toBeInTheDocument();
    expect(screen.getByText('5 / 5')).toBeInTheDocument();
    expect(screen.getByText('Prebunking Champion')).toBeInTheDocument();
  });

  it('calls onRestart when restart is clicked', async () => {
    const onRestart = jest.fn();
    const user = userEvent.setup();

    render(<SimulationResult correctAnswers={2} totalQuestions={5} onRestart={onRestart} />);

    await user.click(screen.getByRole('button', { name: 'Restart simulation' }));

    expect(onRestart).toHaveBeenCalledTimes(1);
  });
});

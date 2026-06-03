import React from 'react';
import { render, screen } from '@/test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import MCQPostMessage from './mcq-post-message';

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}));

jest.mock('lucide-react', () => ({
  CornerUpLeft: () => <svg data-testid="corner-up-left" />,
  ThumbsUp: () => <svg />,
  ThumbsDown: () => <svg />,
  MessageCircle: () => <svg />,
  Send: () => <svg />,
}));

const defaultProps = {
  postId: 'mcq-1',
  user: {
    id: 'echo',
    name: 'Echo',
    handle: '@echo',
    avatar: null,
    isUser: false,
  },
  content: <div>What is 2+2?</div>,
  options: [
    { id: 'a', label: 'Option A' },
    { id: 'b', label: 'Option B' },
    { id: 'c', label: 'Option C' },
  ],
  correctOptionId: 'a',
  answer: null as string | null,
  whyCorrectAnswer: {
    title: <div>Correct!</div>,
    content: <div>Because A is right</div>,
  },
  whyIncorrectAnswer: {
    title: <div>Wrong!</div>,
    content: <div>Because A was right</div>,
  },
  onAnswer: jest.fn(),
  onContinue: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('MCQPostMessage', () => {
  describe('rendering', () => {
    it('renders user name and handle', () => {
      render(<MCQPostMessage {...defaultProps} />);
      expect(screen.getByText('Echo')).toBeInTheDocument();
      expect(screen.getByText('@echo')).toBeInTheDocument();
    });

    it('renders question content', () => {
      render(<MCQPostMessage {...defaultProps} />);
      expect(screen.getByText('What is 2+2?')).toBeInTheDocument();
    });

    it('renders all option buttons', () => {
      render(<MCQPostMessage {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'Option A' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Option B' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Option C' })).toBeInTheDocument();
    });

    it('always disables like, dislike, comment, and share buttons', () => {
      render(<MCQPostMessage {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'Like' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Dislike' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Comment' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Share' })).toBeDisabled();
    });

    it('does not show overlay when not answered', () => {
      render(<MCQPostMessage {...defaultProps} answer={null} />);
      expect(screen.queryByText('Correct!')).not.toBeInTheDocument();
      expect(screen.queryByText('Wrong!')).not.toBeInTheDocument();
    });
  });

  describe('option interaction', () => {
    it('options are enabled when not answered', () => {
      render(<MCQPostMessage {...defaultProps} answer={null} />);
      expect(screen.getByRole('button', { name: 'Option A' })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: 'Option B' })).not.toBeDisabled();
    });

    it('options are disabled when answered', () => {
      render(<MCQPostMessage {...defaultProps} answer="a" />);
      expect(screen.getByRole('button', { name: 'Option A' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Option B' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Option C' })).toBeDisabled();
    });

    it('options are disabled when isDisabled is true', () => {
      render(<MCQPostMessage {...defaultProps} answer={null} isDisabled={true} />);
      expect(screen.getByRole('button', { name: 'Option A' })).toBeDisabled();
    });

    it('calls onAnswer with postId and optionId when option is clicked', async () => {
      const mockOnAnswer = jest.fn();
      const user = userEvent.setup();
      render(<MCQPostMessage {...defaultProps} answer={null} onAnswer={mockOnAnswer} />);

      await user.click(screen.getByRole('button', { name: 'Option B' }));

      expect(mockOnAnswer).toHaveBeenCalledWith('mcq-1', 'b');
    });

    it('does not call onAnswer when already answered', async () => {
      const mockOnAnswer = jest.fn();
      const user = userEvent.setup();
      render(<MCQPostMessage {...defaultProps} answer="a" onAnswer={mockOnAnswer} />);

      await user.click(screen.getByRole('button', { name: 'Option A' }));

      expect(mockOnAnswer).not.toHaveBeenCalled();
    });
  });

  describe('overlay after answering', () => {
    it('shows correct overlay when answer is correct', () => {
      render(<MCQPostMessage {...defaultProps} answer="a" correctOptionId="a" />);
      expect(screen.getByText('Correct!')).toBeInTheDocument();
      expect(screen.getByText('Because A is right')).toBeInTheDocument();
    });

    it('shows incorrect overlay when answer is wrong', () => {
      render(<MCQPostMessage {...defaultProps} answer="b" correctOptionId="a" />);
      expect(screen.getByText('Wrong!')).toBeInTheDocument();
      expect(screen.getByText('Because A was right')).toBeInTheDocument();
    });

    it('shows continue button in overlay', () => {
      render(<MCQPostMessage {...defaultProps} answer="a" />);
      expect(screen.getByRole('button', { name: 'continueButton' })).toBeInTheDocument();
    });

    it('dismisses overlay and calls onContinue when continue is clicked', async () => {
      const mockOnContinue = jest.fn();
      const user = userEvent.setup();
      render(<MCQPostMessage {...defaultProps} answer="a" onContinue={mockOnContinue} />);

      await user.click(screen.getByRole('button', { name: 'continueButton' }));

      expect(mockOnContinue).toHaveBeenCalledWith('mcq-1');
      expect(screen.queryByText('Correct!')).not.toBeInTheDocument();
    });

    it('does not show overlay when answer is null', () => {
      render(<MCQPostMessage {...defaultProps} answer={null} />);
      expect(screen.queryByRole('button', { name: 'continueButton' })).not.toBeInTheDocument();
    });
  });
});

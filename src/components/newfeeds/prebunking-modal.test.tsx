import React from 'react';
import { render, screen } from '@/test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import PrebunkingModal from './prebunking-modal';

// Mock react-modal
jest.mock('react-modal', () => {
  const React = require('react');
  const ModalComponent = function Modal({
    isOpen,
    onRequestClose,
    children,
    contentLabel,
    shouldCloseOnOverlayClick,
    shouldCloseOnEsc,
  }: any) {
    if (!isOpen) return null;
    const handleContentClick = (e: React.MouseEvent) => {
      e.stopPropagation();
    };
    return (
      <div data-testid="modal-overlay" onClick={shouldCloseOnOverlayClick ? onRequestClose : undefined}>
        <div 
          data-testid="modal-content" 
          role="dialog" 
          aria-label={contentLabel}
          onClick={handleContentClick}
        >
          {children}
        </div>
      </div>
    );
  };
  
  ModalComponent.setAppElement = jest.fn();
  
  return ModalComponent;
});

// Mock next-intl useTranslations
const mockTranslations: Record<string, string> = {
  'prebunking.modalLabel': 'Prebunking information modal',
  'prebunking.header.holdOn': 'Hold on!',
  'prebunking.header.misleading': "That's misleading!",
  'prebunking.body.techniquePrefix': 'This post is using',
  'prebunking.body.context': 'Weather is not the same as Climate. Don\'t let isolated incidents distract from long-term data in the World Disasters Report.',
  'prebunking.body.dataLink': 'See the IFRC data on increasing heatwave trends.',
  'prebunking.continueButton': 'Got it! Continue',
};

jest.mock('next-intl', () => ({
  useTranslations: jest.fn((namespace: string) => (key: string) => {
    const fullKey = `${namespace}.${key}`;
    return mockTranslations[fullKey] || key;
  }),
}));

describe('PrebunkingModal', () => {
  const defaultHeader = (
    <>
      <div className="text-lg font-semibold">Hold on!</div>
      <div className="text-sm">That&apos;s misleading!</div>
    </>
  );

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    postId: 'post-123',
    content: <div>Test content</div>,
    header: defaultHeader,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when isOpen is true', () => {
    render(<PrebunkingModal {...defaultProps} />);

    expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    expect(screen.getByText('Hold on!')).toBeInTheDocument();
    expect(screen.getByText("That's misleading!")).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<PrebunkingModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
  });

  it('displays custom header content', () => {
    const customHeader = (
      <>
        <div className="text-lg font-semibold">Custom Title</div>
        <div className="text-sm">Custom subtitle</div>
      </>
    );
    render(<PrebunkingModal {...defaultProps} header={customHeader} />);

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom subtitle')).toBeInTheDocument();
  });

  it('calls onClose when continue button is clicked', async () => {
    const mockOnClose = jest.fn();
    const user = userEvent.setup();
    render(<PrebunkingModal {...defaultProps} onClose={mockOnClose} />);

    const continueButton = screen.getByRole('button', { name: 'Got it! Continue' });
    await user.click(continueButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when overlay is clicked', async () => {
    const mockOnClose = jest.fn();
    const user = userEvent.setup();
    render(<PrebunkingModal {...defaultProps} onClose={mockOnClose} />);

    const overlay = screen.getByTestId('modal-overlay');
    await user.click(overlay);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('displays custom content', () => {
    const customContent = <div>Custom content message</div>;
    render(<PrebunkingModal {...defaultProps} content={customContent} />);

    expect(screen.getByText('Custom content message')).toBeInTheDocument();
  });

  it('has correct modal accessibility attributes', () => {
    render(<PrebunkingModal {...defaultProps} />);

    const modal = screen.getByRole('dialog');
    expect(modal).toHaveAttribute('aria-label', 'Prebunking information modal');
  });

  it('renders with custom postId', () => {
    render(<PrebunkingModal {...defaultProps} postId="custom-post-id" />);

    // Modal should still render correctly
    expect(screen.getByTestId('modal-content')).toBeInTheDocument();
  });
});

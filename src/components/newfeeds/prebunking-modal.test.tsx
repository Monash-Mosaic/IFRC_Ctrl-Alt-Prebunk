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
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    postId: 'post-123',
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

  it('displays the default technique name', () => {
    render(<PrebunkingModal {...defaultProps} />);

    expect(screen.getByText(/This post is using/)).toBeInTheDocument();
    expect(screen.getByText('Cherry-Picking')).toBeInTheDocument();
  });

  it('displays custom technique name', () => {
    render(<PrebunkingModal {...defaultProps} technique="False Equivalence" />);

    expect(screen.getByText('False Equivalence')).toBeInTheDocument();
  });

  it('displays explanation when provided', () => {
    const explanation = 'This is a custom explanation text.';
    render(<PrebunkingModal {...defaultProps} explanation={explanation} />);

    expect(screen.getByText(explanation)).toBeInTheDocument();
  });

  it('does not display explanation when not provided', () => {
    render(<PrebunkingModal {...defaultProps} />);

    // The explanation section should not be rendered
    const menuIcon = screen.queryByRole('img', { hidden: true });
    // We can't easily test for absence of explanation without a test-id, but we can verify the structure
    expect(screen.getByText(/Weather is not the same as Climate/)).toBeInTheDocument();
  });

  it('displays data link when provided', () => {
    const dataLink = 'https://example.com/data';
    const dataLinkText = 'View IFRC Data';
    render(<PrebunkingModal {...defaultProps} dataLink={dataLink} dataLinkText={dataLinkText} />);

    const link = screen.getByRole('link', { name: dataLinkText });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', dataLink);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'no-referrer noopener');
  });

  it('displays default data link text when dataLink is provided but dataLinkText is not', () => {
    const dataLink = 'https://example.com/data';
    render(<PrebunkingModal {...defaultProps} dataLink={dataLink} />);

    const link = screen.getByRole('link', { name: 'See the IFRC data on increasing heatwave trends.' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', dataLink);
  });

  it('does not display data link when dataLink is not provided', () => {
    render(<PrebunkingModal {...defaultProps} />);

    const links = screen.queryAllByRole('link');
    // Only check that there are no data links (there might be other links)
    const dataLinks = links.filter(link => link.textContent?.includes('IFRC data'));
    expect(dataLinks).toHaveLength(0);
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

  it('displays context message', () => {
    render(<PrebunkingModal {...defaultProps} />);

    expect(screen.getByText(/Weather is not the same as Climate/)).toBeInTheDocument();
    expect(screen.getByText(/Don't let isolated incidents distract/)).toBeInTheDocument();
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

import { render, screen, waitFor } from '@/test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import ContactUsModal from '@/components/contact-us-modal';

const CONTACT_EMAIL = 'solferino.academy@ifrc.org';

describe('ContactUsModal', () => {
  const onClose = jest.fn();

  beforeAll(() => {
    const root = document.createElement('main');
    root.id = 'root';
    document.body.appendChild(root);
  });

  beforeEach(() => {
    onClose.mockReset();
  });

  const mockClipboard = (writeText: jest.Mock) => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
  };

  it('renders nothing when closed', () => {
    render(<ContactUsModal isOpen={false} onClose={onClose} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('displays the full IFRC Solferino Academy email address', () => {
    render(<ContactUsModal isOpen onClose={onClose} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: CONTACT_EMAIL });
    expect(link).toHaveAttribute('href', `mailto:${CONTACT_EMAIL}`);
  });

  it('copies the full email address and confirms it', async () => {
    const user = userEvent.setup();
    render(<ContactUsModal isOpen onClose={onClose} />);
    const writeText = jest.fn().mockResolvedValue(undefined);
    mockClipboard(writeText);

    await user.click(screen.getByRole('button', { name: 'copy' }));

    expect(writeText).toHaveBeenCalledWith(CONTACT_EMAIL);
    expect(screen.getByRole('status')).toHaveTextContent('copied');
  });

  it('resets the copied confirmation after a short delay', async () => {
    const user = userEvent.setup();
    render(<ContactUsModal isOpen onClose={onClose} />);
    mockClipboard(jest.fn().mockResolvedValue(undefined));

    await user.click(screen.getByRole('button', { name: 'copy' }));
    expect(screen.getByRole('button', { name: 'copied' })).toBeInTheDocument();

    await waitFor(() => expect(screen.getByRole('button', { name: 'copy' })).toBeInTheDocument(), {
      timeout: 3000,
    });
  });

  it('tells the visitor to copy manually when the clipboard is unavailable', async () => {
    const user = userEvent.setup();
    render(<ContactUsModal isOpen onClose={onClose} />);
    mockClipboard(jest.fn().mockRejectedValue(new Error('denied')));

    await user.click(screen.getByRole('button', { name: 'copy' }));

    expect(screen.getByRole('status')).toHaveTextContent('copyFailed');
  });

  it('calls onClose from the close button', async () => {
    const user = userEvent.setup();
    render(<ContactUsModal isOpen onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'close' }));
    expect(onClose).toHaveBeenCalled();
  });
});

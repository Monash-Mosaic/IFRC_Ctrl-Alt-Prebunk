import { render, screen, waitFor } from '@/test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import ContactUsModal from '@/components/contact-us-modal';

const MESSAGE_LIMIT = 500;

describe('ContactUsModal', () => {
  const onClose = jest.fn();
  const fetchMock = jest.fn();

  beforeAll(() => {
    const root = document.createElement('main');
    root.id = 'root';
    document.body.appendChild(root);
  });

  beforeEach(() => {
    fetchMock.mockReset();
    onClose.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  const fillForm = async (user: ReturnType<typeof userEvent.setup>, message = 'Hello') => {
    await user.type(screen.getByLabelText('email'), 'visitor@example.org');
    await user.type(screen.getByLabelText('name'), 'Visitor');
    await user.type(screen.getByLabelText('country'), 'Australia');
    await user.type(screen.getByLabelText('message'), message);
  };

  it('renders nothing when closed', () => {
    render(<ContactUsModal isOpen={false} onClose={onClose} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the four required fields and a submit button', () => {
    render(<ContactUsModal isOpen onClose={onClose} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('email')).toHaveAttribute('type', 'email');
    for (const field of ['email', 'name', 'country', 'message']) {
      expect(screen.getByLabelText(field)).toBeRequired();
    }
    expect(screen.getByRole('button', { name: 'submit' })).toBeInTheDocument();
  });

  it('accepts exactly 500 characters and blocks anything longer', async () => {
    const user = userEvent.setup();
    render(<ContactUsModal isOpen onClose={onClose} />);
    const message = screen.getByLabelText('message');

    expect(message).toHaveAttribute('maxLength', String(MESSAGE_LIMIT));

    await user.click(message);
    await user.paste('a'.repeat(MESSAGE_LIMIT + 20));
    expect(message).toHaveValue('a'.repeat(MESSAGE_LIMIT));
  });

  it('posts the enquiry and shows a success message', async () => {
    fetchMock.mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    render(<ContactUsModal isOpen onClose={onClose} />);

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'submit' }));

    expect(fetchMock).toHaveBeenCalledWith('/api/contact', expect.objectContaining({ method: 'POST' }));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      email: 'visitor@example.org',
      name: 'Visitor',
      country: 'Australia',
      message: 'Hello',
    });
    expect(await screen.findByRole('status')).toHaveTextContent('success');
  });

  it('keeps the entered details and shows an error when sending fails', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500 });
    const user = userEvent.setup();
    render(<ContactUsModal isOpen onClose={onClose} />);

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'submit' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('error');
    expect(screen.getByLabelText('message')).toHaveValue('Hello');
  });

  it('does not submit when required fields are empty', async () => {
    const user = userEvent.setup();
    render(<ContactUsModal isOpen onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'submit' }));

    await waitFor(() => expect(fetchMock).not.toHaveBeenCalled());
  });

  it('calls onClose from the close button', async () => {
    const user = userEvent.setup();
    render(<ContactUsModal isOpen onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'close' }));
    expect(onClose).toHaveBeenCalled();
  });
});

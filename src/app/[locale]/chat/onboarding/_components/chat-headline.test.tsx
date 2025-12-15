import { render } from '@/test-utils/test-utils';
import ChatHeadline from './chat-headline';

describe('ChatHeadline', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<ChatHeadline name="Paula" />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with different name', () => {
    const { container } = render(<ChatHeadline name="Echo" />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with long name', () => {
    const { container } = render(<ChatHeadline name="Very Long Name That Might Wrap" />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with special characters in name', () => {
    const { container } = render(<ChatHeadline name="Paula & Friends" />);
    expect(container).toMatchSnapshot();
  });
});

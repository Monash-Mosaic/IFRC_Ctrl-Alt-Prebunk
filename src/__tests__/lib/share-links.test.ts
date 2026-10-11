import { shareLink } from '@/lib/share-links';

const DATA = { title: 'Title', text: 'Text', url: 'https://example.org/' };

function setNavigator(props: Partial<Record<'share' | 'canShare' | 'clipboard', unknown>>) {
  for (const key of ['share', 'canShare', 'clipboard'] as const) {
    Object.defineProperty(navigator, key, { configurable: true, value: props[key] });
  }
}

describe('shareLink', () => {
  afterEach(() => setNavigator({}));

  it('uses the native share sheet when available', async () => {
    const share = jest.fn().mockResolvedValue(undefined);
    setNavigator({ share, canShare: jest.fn(() => true) });

    await expect(shareLink(DATA)).resolves.toBe('shared');
    expect(share).toHaveBeenCalledWith(DATA);
  });

  it('reports a cancelled share without falling back', async () => {
    const writeText = jest.fn();
    setNavigator({
      share: jest.fn().mockRejectedValue(Object.assign(new Error('x'), { name: 'AbortError' })),
      clipboard: { writeText },
    });

    await expect(shareLink(DATA)).resolves.toBe('cancelled');
    expect(writeText).not.toHaveBeenCalled();
  });

  it('copies the link when native sharing is unsupported', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    setNavigator({ clipboard: { writeText } });

    await expect(shareLink(DATA)).resolves.toBe('copied');
    expect(writeText).toHaveBeenCalledWith(DATA.url);
  });

  it('copies the link when the native share fails', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    setNavigator({
      share: jest.fn().mockRejectedValue(new Error('NotAllowed')),
      clipboard: { writeText },
    });

    await expect(shareLink(DATA)).resolves.toBe('copied');
  });

  it('copies the link when the data cannot be shared natively', async () => {
    const share = jest.fn();
    const writeText = jest.fn().mockResolvedValue(undefined);
    setNavigator({ share, canShare: jest.fn(() => false), clipboard: { writeText } });

    await expect(shareLink(DATA)).resolves.toBe('copied');
    expect(share).not.toHaveBeenCalled();
  });

  it('reports failure when neither sharing nor copying is possible', async () => {
    setNavigator({ clipboard: { writeText: jest.fn().mockRejectedValue(new Error('denied')) } });

    await expect(shareLink(DATA)).resolves.toBe('failed');
  });
});

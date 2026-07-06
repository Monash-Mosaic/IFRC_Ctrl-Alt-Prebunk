import React from 'react';
import { render, screen } from '@/test-utils/test-utils';

jest.mock('next/script', () => ({
  __esModule: true,
  default: ({
    src,
    id,
    children,
    ...props
  }: {
    src?: string;
    id?: string;
    children?: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <div
      data-testid={id ?? 'external-script'}
      data-src={src}
      data-props={JSON.stringify(props)}
    >
      {children}
    </div>
  ),
}));

const originalCfToken = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;
const originalGaId = process.env.NEXT_PUBLIC_GA_ID;

describe('CloudflareWebPerformance', () => {
  afterEach(() => {
    process.env.NEXT_PUBLIC_CF_BEACON_TOKEN = originalCfToken;
    jest.resetModules();
  });

  it('renders nothing when beacon token is missing', () => {
    delete process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;
    const CloudflareWebPerformance = require('@/components/cloudflare-web-performance').default;

    const { container } = render(<CloudflareWebPerformance />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the Cloudflare beacon script when token is set', () => {
    process.env.NEXT_PUBLIC_CF_BEACON_TOKEN = 'test-beacon-token';
    const CloudflareWebPerformance = require('@/components/cloudflare-web-performance').default;

    render(<CloudflareWebPerformance />);

    const script = screen.getByTestId('external-script');
    expect(script).toHaveAttribute(
      'data-src',
      'https://static.cloudflareinsights.com/beacon.min.js',
    );
    expect(script).toHaveAttribute(
      'data-props',
      expect.stringContaining('test-beacon-token'),
    );
  });
});

describe('GoogleAnalytics', () => {
  afterEach(() => {
    process.env.NEXT_PUBLIC_GA_ID = originalGaId;
    jest.resetModules();
  });

  it('renders nothing when GA id is missing', () => {
    delete process.env.NEXT_PUBLIC_GA_ID;
    const GoogleAnalytics = require('@/components/google-analytics').default;

    const { container } = render(<GoogleAnalytics />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders gtag loader and inline config when GA id is set', () => {
    process.env.NEXT_PUBLIC_GA_ID = 'G-TEST123';
    const GoogleAnalytics = require('@/components/google-analytics').default;

    render(<GoogleAnalytics />);

    expect(screen.getByTestId('external-script')).toHaveAttribute(
      'data-src',
      'https://www.googletagmanager.com/gtag/js?id=G-TEST123',
    );

    const inlineScript = screen.getByTestId('google-analytics');
    expect(inlineScript.textContent).toContain("gtag('config', 'G-TEST123')");
  });
});

import type { NextConfig } from 'next';
import createMDX from '@next/mdx';
import createNextIntlPlugin from 'next-intl/plugin';
import createBundleAnalyzer from '@next/bundle-analyzer';

function compose<T>(...fns: ((config: T) => T)[]) {
  return (config: T) => fns.reduce((conf, fn) => fn(conf), config);
}

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
const withMDX = createMDX({
  options: {
    // Customize remark/rehype plugins here if needed
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  transpilePackages: ['geist'],
  reactStrictMode: true,
};

export default compose(withBundleAnalyzer, withNextIntl, withMDX)(nextConfig);

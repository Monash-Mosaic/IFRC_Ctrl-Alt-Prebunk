import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'es', 'fr'],
  defaultLocale: 'en',
});

export const config = {
  matcher: [
    '/',
    '/(en|es|fr)/:path*',
  ],
};

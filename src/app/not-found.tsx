'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Error from 'next/error';
import { routing } from '@/i18n/routing';

export default function NotFound() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect /api routes - show standard 404
    if (pathname?.startsWith('/api')) {
      return;
    }

    // Redirect non-API routes to default locale
    // The catch-all route will then trigger the locale-specific 404
    if (pathname && !pathname.startsWith('/api')) {
      const isLocaleRoute = routing.locales.some((locale) => pathname.startsWith(`/${locale}`));
      if (!isLocaleRoute) {
        // Preserve the path and redirect to default locale
        const pathWithoutLeadingSlash = pathname === '/' ? '' : pathname.slice(1);
        router.replace(
          `/${routing.defaultLocale}${pathWithoutLeadingSlash ? `/${pathWithoutLeadingSlash}` : ''}`
        );
      }
    }
  }, [pathname, router]);

  // For /api routes, show standard Next.js error page
  if (pathname?.startsWith('/api')) {
    return (
      <html lang="en">
        <body>
          <Error statusCode={404} />
        </body>
      </html>
    );
  }

  // Show redirecting message for non-API routes
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
          <div className="text-center">
            <p className="text-gray-600">Redirecting...</p>
          </div>
        </div>
      </body>
    </html>
  );
}

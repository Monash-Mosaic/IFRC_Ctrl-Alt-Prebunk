"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { routing } from "@/i18n/routing";

export default function RootError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Log error for debugging
    console.error("Root error:", error);

    // Don't redirect /api routes - they should handle their own errors
    if (pathname?.startsWith("/api")) {
      return;
    }

    // Redirect non-API routes to default locale if not already on a locale route
    if (pathname && !pathname.startsWith("/api")) {
      const isLocaleRoute = routing.locales.some((locale) =>
        pathname.startsWith(`/${locale}`)
      );
      if (!isLocaleRoute) {
        router.replace(`/${routing.defaultLocale}`);
      }
    }
  }, [pathname, router, error]);

  // Show redirecting message for non-API routes
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
          <div className="text-center">
            <h1 className="mb-4 font-mono text-6xl font-bold text-[#E63946]">
              500
            </h1>
            <p className="mb-8 text-gray-600">An error occurred. Redirecting...</p>
          </div>
        </div>
      </body>
    </html>
  );
}


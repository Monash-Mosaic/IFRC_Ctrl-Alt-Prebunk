"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors.500");

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="mb-4 font-mono text-6xl font-bold text-[#E63946]">
          500
        </h1>
        <h2 className="mb-4 font-mono text-2xl font-semibold text-[#0D1B3E]">
          {t("title")}
        </h2>
        <p className="mb-4 text-gray-600">{t("description")}</p>
        {error.digest && (
          <p className="mb-8 text-sm text-gray-500">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="inline-block rounded bg-[#E63946] px-6 py-3 font-medium text-white transition-colors hover:bg-[#D62839] focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:ring-offset-2"
          >
            {t("backHome")}
          </button>
          <Link
            href="/"
            className="inline-block rounded border-2 border-[#E63946] px-6 py-3 font-medium text-[#E63946] transition-colors hover:bg-[#E63946] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:ring-offset-2"
          >
            {t("backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}


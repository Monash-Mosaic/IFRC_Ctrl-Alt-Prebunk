import { getTranslations } from "next-intl/server";
import { Link, routing } from "@/i18n/routing";
import Illustration from "./_components/Illustration";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function ChatPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: "chat" });

  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center px-4 py-8 md:py-12">
      <div className="flex w-full max-w-2xl flex-col items-center gap-8">
        {/* Illustration */}
        <div className="relative w-full">
          <Illustration width={"100%"} />
        </div>

        {/* Action Buttons */}
        <div className="flex w-full max-w-md flex-col gap-4">
          {/* Primary Button - Start onboarding chat */}
          <Link
            href="/chat/onboarding"
            className="flex items-center justify-center rounded-lg border border-white bg-[#2FE89F] px-6 py-4 text-center font-semibold text-white transition-all hover:bg-[#27d089]"
          >
            {t("startOnboarding")}
          </Link>

          {/* Secondary Button - Skip */}
          <Link
            href="/"
            className="flex items-center justify-center rounded-lg border-2 border-dashed border-[#0D1B3E] bg-[#F5F5F5] px-6 py-4 text-center font-medium text-[#0D1B3E] transition-all hover:bg-[#E8E9ED]"
          >
            {t("skip")}
          </Link>
        </div>
      </div>
    </div>
  );
}


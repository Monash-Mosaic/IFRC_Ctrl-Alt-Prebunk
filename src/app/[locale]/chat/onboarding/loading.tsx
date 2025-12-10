import { getTranslations } from "next-intl/server";

export default async function Loading() {
  const t = await getTranslations("common");

  return (
    <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center">
      <div
        className="flex items-center justify-center"
        role="status"
        aria-label={t("loading")}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute h-12 w-12 animate-spin rounded-full border-4 border-[#E8E9ED] border-t-[#2FE89F]" />
          </div>
          <p className="text-sm text-[#0D1B3E]">{t("loading")}</p>
        </div>
      </div>
    </div>
  );
}

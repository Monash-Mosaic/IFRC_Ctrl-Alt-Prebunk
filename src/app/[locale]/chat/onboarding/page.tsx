'use client';

import dynamic from "next/dynamic";
import Loading from "@/components/Loading";
import { useTranslations } from "next-intl";

export default function OnboardingPage() {
  const t = useTranslations("common");
  const OnboardingFlow = dynamic(() => import("./_components/OnboardingFlow"), {
    ssr: false,
    loading: () => <Loading displayText={t("loading")} /> 
  });

  return (
    <div className="mx-auto flex h-[calc(100vh-10rem)] max-w-4xl flex-col px-4 py-6">
      <OnboardingFlow />
    </div>
  );
}

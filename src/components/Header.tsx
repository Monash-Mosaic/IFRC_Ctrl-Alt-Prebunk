import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

export default async function Header() {
  const t = await getTranslations("header");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#E8E9ED]">
      {/* Main Header Row */}
      <div className="flex h-full items-center justify-between px-4 md:px-6">
        {/* Left: IFRC Logo */}
        <div className="flex items-center gap-2">
          {/* IFRC Logo */}
          <div className="flex items-center gap-1">
            <Link
              href="/"
              className="focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:ring-offset-2 rounded"
            >
              <Image
                src="/images/logos/IFRC-Solferino.png"
                alt={t("ifrcLogoAlt")}
                height={61.35}
                width={223.67}
                className="h-8 w-auto"
              />
            </Link>
          </div>
        </div>

        {/* Center: Title */}
        <h1 className="font-mono text-lg font-bold tracking-wider text-[#E63946] md:text-2xl">
          <span className="hidden md:inline">{t("title")}</span>
          <span className="md:hidden">{t("titleMobile")}</span>
        </h1>

        {/* Right: Monash Logo */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:ring-offset-2 rounded"
          >
            <Image
              src="/images/logos/Monash-MOSAIC.png"
              alt={t("monashLogoAlt")}
              height={302.82}
              width={72}
              className="h-8 w-auto"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}

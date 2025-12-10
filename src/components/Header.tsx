import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";


function Title({
  width= 573,
  height = 71,
  className,
}: {
  width?: number | string;
  height?: number | string;
  className?: string;
}) {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 278 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M7.5 5V2.5H2.5V0H7.5V2.5H10V5H7.5ZM2.5 12.5V10H0V2.5H2.5V10H7.5V12.5H2.5ZM7.5 10V7.5H10V10H7.5ZM17.5 12.5V2.5H15V0H22.5V2.5H20V12.5H17.5ZM27.5 12.5V0H35V2.5H37.5V5H35V10H37.5V12.5H35V10H32.5V7.5H30V12.5H27.5ZM30 5H34.9V2.5H30V5ZM42.5 12.5V0H45V10H50V12.5H42.5ZM70 12.5V7.5H65V5H70V0H72.5V5H77.5V7.5H72.5V12.5H70ZM92.5 12.5V2.5H95V0H100V2.5H102.5V12.5H100V7.5H95V12.5H92.5ZM95 5H100V2.6H95V5ZM107.5 12.5V0H110V10H115V12.5H107.5ZM122.5 12.5V2.5H120V0H127.5V2.5H125V12.5H122.5ZM147.5 12.5V7.5H142.5V5H147.5V0H150V5H155V7.5H150V12.5H147.5ZM170 12.5V0H177.5V2.5H180V5H177.5V7.5H172.5V12.5H170ZM172.5 5H177.4V2.5H172.5V5ZM185 12.5V0H192.5V2.5H195V5H192.5V10H195V12.5H192.5V10H190V7.5H187.5V12.5H185ZM187.5 5H192.4V2.5H187.5V5ZM200 12.5V0H207.5V2.5H202.5V5H207.5V7.5H202.5V10H207.5V12.5H200ZM212.5 12.5V0H220V2.5H222.5V10H220V12.5H212.5ZM215 5H219.9V2.5H215V5ZM215 10H219.9V7.5H215V10ZM230 12.5V10H227.5V0H230V10H235V12.5H230ZM235 10V0H237.5V10H235ZM242.5 12.5V0H245V2.5H247.5V5H250V7.5H252.5V0H255V12.5H252.5V10H250V7.5H247.5V5H245V12.5H242.5ZM260 12.5V0H262.5V5H265V7.5H267.5V10H270V12.5H267.5V10H265V7.5H262.5V12.5H260ZM267.5 2.5V0H270V2.5H267.5ZM265 5V2.5H267.5V5H265ZM275 7.5V0H277.5V7.5H275ZM275 12.5V10H277.5V12.5H275Z" fill="#EE2435"/>
    </svg>
  );
}

export default async function Header() {
  const t = await getTranslations("header");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#E8E9ED]">
      <div className="flex h-full items-center justify-center md:justify-between md:px-6">
        {/* Left: IFRC Logo (hidden on mobile) */}
        <div className="hidden items-center gap-2 md:flex">
          <div className="flex items-center gap-1">
            <Link href="/">
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
        <div className="flex items-center gap-2 md:p-6">
          <Link
            href="/"
            className="inline-flex w-full max-w-[260px] items-center md:max-w-[573px]"
          >
            <Title width={"100%"} height={"100%"} />
          </Link>
        </div>

        {/* Right: Monash Logo (hidden on mobile) */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/"
            className="rounded focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:ring-offset-2"
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

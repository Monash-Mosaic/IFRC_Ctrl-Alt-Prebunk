import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { SOLFERINO_ACADEMY_URL } from '@/lib/share-links';
import Title from './title';

export default async function Header() {
  const t = await getTranslations('header');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white">
      <div className="flex h-full items-center justify-between gap-3 px-3 md:gap-2 md:px-6">
        {/* Left: IFRC Logo */}
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex items-center gap-1">
            <a href={SOLFERINO_ACADEMY_URL}>
              <Image
                src="/images/logos/IFRC-Solferino.png"
                alt={t('ifrcLogoAlt')}
                height={61.35}
                width={223.67}
                className="h-4 w-auto max-w-16 object-contain md:h-8 md:max-w-none"
              />
            </a>
          </div>
        </div>

        {/* Center: Title */}
        <div className="flex min-w-0 items-center gap-2 max-md:w-full max-md:max-w-[210px]">
          <Link href="/" className="w-full">
            <Title width={'100%'} height={'100%'} />
          </Link>
        </div>

        {/* Right: Monash Logo */}
        <div className="flex shrink-0 items-center gap-4">
          <a
            href="https://www.mosaic-monash.ai/"
            className="rounded focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:ring-offset-2"
          >
            <Image
              src="/images/logos/Monash-MOSAIC.png"
              alt={t('monashLogoAlt')}
              height={655}
              width={2747}
              className="h-7 w-auto max-w-28 object-contain md:h-9 md:max-w-none"
            />
          </a>
        </div>
      </div>
    </header>
  );
}

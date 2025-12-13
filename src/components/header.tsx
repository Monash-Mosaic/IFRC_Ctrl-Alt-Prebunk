import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import Title from './title';

export default async function Header() {
  const t = await getTranslations('header');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#E8E9ED]">
      <div className="flex h-full items-center justify-center md:justify-between md:px-6">
        {/* Left: IFRC Logo (hidden on mobile) */}
        <div className="hidden items-center gap-2 md:flex">
          <div className="flex items-center gap-1">
            <Link href="/">
              <Image
                src="/images/logos/IFRC-Solferino.png"
                alt={t('ifrcLogoAlt')}
                height={61.35}
                width={223.67}
                className="h-8 w-auto bg-white"
              />
            </Link>
          </div>
        </div>

        {/* Center: Title */}
        <div className="flex items-center gap-2">
          <Link href="/" className="w-full">
            <Title width={'100%'} height={'100%'} />
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
              alt={t('monashLogoAlt')}
              height={2747}
              width={655}
              className="h-8 w-auto"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}

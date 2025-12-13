import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export default async function NotFoundPage() {
  const t = await getTranslations('errors.404');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="mb-4 font-mono text-6xl font-bold text-[#E63946]">404</h1>
        <h2 className="mb-4 font-mono text-2xl font-semibold text-[#0D1B3E]">{t('title')}</h2>
        <p className="mb-8 text-gray-600">{t('description')}</p>
        <Link
          href="/"
          className="inline-block rounded bg-[#E63946] px-6 py-3 font-medium text-white transition-colors hover:bg-[#D62839] focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:ring-offset-2"
        >
          {t('backHome')}
        </Link>
      </div>
    </div>
  );
}

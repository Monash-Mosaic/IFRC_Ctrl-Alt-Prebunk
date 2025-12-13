import { getTranslations } from 'next-intl/server';

export default async function UnderDevelopment() {
  const t = await getTranslations('underDevelopment');

  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center p-6">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-[#E8E9ED] p-6">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#6B7280]"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
        </div>
        <h1 className="mb-4 font-mono text-2xl font-bold text-[#0D1B3E] md:text-3xl">
          {t('title')}
        </h1>
        <p className="text-lg text-[#6B7280]">{t('message')}</p>
      </div>
    </div>
  );
}

'use client';

import Loading from '@/components/loading';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';

export default function Home() {
  const t = useTranslations('common');
  const HomeContent = dynamic(() => import('@/components/home-content'), {
    ssr: false,
    loading: () => <Loading displayText={t('loading')} />,
  });
  return <HomeContent />;
}

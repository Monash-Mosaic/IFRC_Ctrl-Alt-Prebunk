'use client';

import Loading from '@/components/loading';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';

function HomeLoadingFallback() {
  const t = useTranslations('common');
  return <Loading displayText={t('loading')} />;
}

const HomeContent = dynamic(() => import('@/components/home-content'), {
  ssr: false,
  loading: HomeLoadingFallback,
});

export default function Home() {
  return <HomeContent />;
}

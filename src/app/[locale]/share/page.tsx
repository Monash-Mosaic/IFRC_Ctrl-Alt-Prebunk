'use client';

import Loading from '@/components/loading';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';

function ShareLoadingFallback() {
  const t = useTranslations('common');
  return <Loading displayText={t('loading')} />;
}

// Client-only, like the home feed: the player's result lives in localStorage.
const ShareContent = dynamic(() => import('@/components/share-content'), {
  ssr: false,
  loading: ShareLoadingFallback,
});

export default function SharePage() {
  return <ShareContent />;
}

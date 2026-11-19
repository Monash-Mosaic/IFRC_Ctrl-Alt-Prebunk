'use client';

import Loading from '@/components/loading';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';

function ProfileLoadingFallback() {
  const t = useTranslations('common');
  return <Loading displayText={t('loading')} />;
}

// Client-only, like the home feed: the profile and score live in localStorage.
const ProfileContent = dynamic(() => import('@/components/profile-content'), {
  ssr: false,
  loading: ProfileLoadingFallback,
});

export default function ProfilePage() {
  return <ProfileContent />;
}

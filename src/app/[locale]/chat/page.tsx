'use client';

import UnderDevelopment from '@/components/under-development';
import { useTranslations } from 'next-intl';

export default function ChatPage() {
  const underDevelopment = useTranslations('underDevelopment');
  return <UnderDevelopment title={underDevelopment('title')} message={underDevelopment('message')} />;
}

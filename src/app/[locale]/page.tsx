'use client';

import dynamic from 'next/dynamic';

export default function Home() {
  const HomeContent = dynamic(() => import('@/components/home-content'), {
    ssr: false,
  });
  return <HomeContent />;
}

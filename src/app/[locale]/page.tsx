'use client';

import dynamic from 'next/dynamic';

const HomeContent = dynamic(() => import('@/components/home-content'), {
  ssr: false,
});

export default function Home() {
  return <HomeContent />;
}

'use client';

import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { getContent, type ContentModule } from '@/contents';
import type { Locale } from '@/i18n/routing';

/**
 * React hook to lazy load content for the current locale
 * 
 * @returns Object containing the content module and loading state
 * 
 * @example
 * ```tsx
 * const { content, isLoading } = useContent();
 * if (isLoading) return <Loading />;
 * return <div>{content.contentList}</div>;
 * ```
 */
export function useContent() {
  const locale = useLocale();
  const [contentModule, setContentModule] = useState<ContentModule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadContent() {
      try {
        setIsLoading(true);
        setError(null);
        const module = await getContent(locale as Locale);
        if (isMounted) {
          setContentModule(module);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load content'));
          setIsLoading(false);
        }
      }
    }

    loadContent();

    return () => {
      isMounted = false;
    };
  }, [locale]);

  return {
    content: contentModule,
    isLoading,
    error,
  };
}


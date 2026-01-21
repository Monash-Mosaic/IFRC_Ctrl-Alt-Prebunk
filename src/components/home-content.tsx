'use client';

import ChatContent from '@/components/chat-content';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { STORAGE_KEYS } from '@/lib/local-storage';
import { useLocalStorage } from '@/lib/use-local-storage';
import LikeDislikePostMessage from '@/components/newfeeds/like-dislike-post-message';
import POSTS from '@/app/[locale]/chat/onboarding/_posts';
import VerticalCarousel from '@/components/vertical-carousel';
import { cn } from '@/lib/utils';

import { useEffect, useState } from 'react';
import type { EmblaCarouselType } from 'embla-carousel';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Configuration for posts - easily modifiable
const POSTS_CONFIG = [
  {
    name: 'Echo Post 1',
    handle: '@echo',
    mediaUrl: '/images/example/echo-post-img.jpg',
    mediaType: 'image' as const,
  },
  {
    name: 'Echo Post 2',
    handle: '@echo',
    mediaUrl: '/images/example/echo-post-img.jpg',
    mediaType: 'image' as const,
  },
  {
    name: 'Echo Post 3',
    handle: '@echo',
    mediaUrl: '/images/example/echo-post-img.jpg',
    mediaType: 'image' as const,
  },
] as const;

export default function HomeContent() {
  const locale = useLocale();
  const t = useTranslations('chat');
  const [onboardingCompleted, setOnboardingCompleted] = useLocalStorage<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETED, false);
  const post = POSTS[locale];

  // Dynamically generate messages from configuration
  const messages = POSTS_CONFIG.map((postConfig, index) => ({
    id: String(index + 1),
    type: 'post' as const,
    post: {
      name: postConfig.name,
      handle: postConfig.handle,
      contentKey: post.echoPost,
      mediaUrl: postConfig.mediaUrl,
      mediaType: postConfig.mediaType,
    },
  }));

  const handleSkipClick = () => {
    setOnboardingCompleted(true);
  };

  // NEW: Embla + engagement state (per post)
  const [emblaApi, setEmblaApi] = useState<EmblaCarouselType | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [engaged, setEngaged] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on('select', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  const selectedPostId = messages[selectedIndex]?.id;
  const hasEngagedCurrent = selectedPostId ? !!engaged[selectedPostId] : false;
  const canGoNext = !!emblaApi?.canScrollNext();
  const canGoPrev = !!emblaApi?.canScrollPrev();
  const nextEnabled = hasEngagedCurrent && canGoNext;
  const prevEnabled = canGoPrev;

  const handleEngaged = (postId: string) => {
    setEngaged((prev) => {
      // Only update if not already engaged to avoid unnecessary re-renders
      if (prev[postId]) {
        return prev;
      }
      return { ...prev, [postId]: true };
    });
  };

  const handleNext = () => {
    if (!emblaApi) return;
    if (!nextEnabled) return;
    emblaApi.scrollNext();
  };

  const handlePrevious = () => {
    if (!emblaApi) return;
    if (!prevEnabled) return;
    emblaApi.scrollPrev();
  };

  if (!onboardingCompleted) {
    return <ChatContent startOnboardingText={t('startOnboarding')} skipText={t('skip')} onSkipClick={handleSkipClick} />;
  }

  return (
    <div className="mx-auto flex flex-col md:px-4 pt-6 overflow-hidden">
      <div className="mx-auto flex items-start justify-start h-[calc(100dvh-var(--spacing)*46)] md:h-[calc(100vh-var(--spacing)*30)] max-w-md flex-col w-full relative overflow-hidden">
        <div className="flex-1 w-full h-full">

        {/* Up arrow (Previous post) */}
        <button
          type="button"
          onClick={handlePrevious}
          disabled={!prevEnabled}
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2 z-20 -translate-y-[60px]',
            'rounded-full w-12 h-12 flex items-center justify-center',
            'transition-all hover:scale-110 active:scale-95 shadow-lg',
            'bg-[#011E41] hover:bg-[#002A5A] active:bg-[#001A3F]',
            !prevEnabled
              ? 'opacity-30 cursor-not-allowed bg-[#6B7280] hover:bg-[#6B7280]'
              : 'cursor-pointer'
          )}
          aria-label="Previous post"
        >
          <ChevronUp size={24} className="text-white" strokeWidth={2.5} aria-hidden="true" />
        </button>

        {/* Down arrow (Next post) */}
        <button
          type="button"
          onClick={handleNext}
          disabled={!nextEnabled}
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2 z-30 translate-y-[60px]',
            'rounded-full w-12 h-12 flex items-center justify-center',
            'transition-all hover:scale-110 active:scale-95 shadow-lg',
            nextEnabled
              ? 'bg-[#2FE89F] hover:bg-[#00FF9C] active:bg-[#26D68F] cursor-pointer opacity-100'
              : 'bg-[#6B7280] opacity-50 cursor-not-allowed hover:bg-[#6B7280]'
          )}
          aria-label="Next post"
        >
          <ChevronDown size={24} className="text-[#011E41]" strokeWidth={2.5} aria-hidden="true" />
        </button>

        <VerticalCarousel
          options={{
            axis: 'y',
            // CHANGED: snap scrolling like Shorts/quizzes (one at a time)
            dragFree: false,
            skipSnaps: false,
            align: 'start',
            slidesToScroll: 1,
            containScroll: 'trimSnaps',
            watchDrag: true,
          }}
          // NEW: lock forward nav if user hasn't engaged with current post
          lockNext={!hasEngagedCurrent && canGoNext}
          // NEW: get embla api in parent for arrow + index tracking
          onApi={(api) => setEmblaApi(api)}
        >
          {(api) => {
            return messages.map((message, index) => {
              const isActive = api?.selectedScrollSnap() === index;
              return (
                <div
                  className={cn(
                    'transform-gpu flex-shrink-0 w-full',
                    isActive ? 'opacity-100' : 'opacity-70'
                  )}
                  style={{ 
                    // Each slide should be the full height of the carousel container
                    // This ensures proper scrolling with snap points
                    height: '100%',
                    minHeight: '100%',
                  }}
                  key={message.id}
                >
                  <div className="h-full pt-4 overflow-y-auto">
                    <LikeDislikePostMessage
                      postId={message.id}
                      name={message.post.name}
                      handle={message.post.handle}
                      content={message.post.contentKey}
                      mediaUrl={message.post.mediaUrl}
                      mediaType={message.post.mediaType as 'image' | 'video'}
                      // NEW: mark engagement when user completes interaction
                      onEngaged={handleEngaged}
                    />
                  </div>
                </div>
              );
            });
          }}
        </VerticalCarousel>
        </div>
      </div>
    </div>
  );
}

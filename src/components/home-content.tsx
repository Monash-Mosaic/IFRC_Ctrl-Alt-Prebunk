'use client';

import { useEffect, useState, useCallback } from 'react';
import ChatContent from '@/components/chat-content';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { STORAGE_KEYS } from '@/lib/local-storage';
import { useLocalStorage } from '@/lib/use-local-storage';
import PrebunkingModal from '@/components/newfeeds/prebunking-modal';
import CONTENTS from '@/contents';
import { ContentType, LikeDislikeContent } from '@/contents/en';
import { createGameStore } from '@/lib/use-game-store';
import { useCredibilityStore } from '@/lib/use-credibility-store';
import Modal from 'react-modal';
import type { EmblaCarouselType } from 'embla-carousel';
import { ChevronDown, ChevronUp } from 'lucide-react';
import VerticalCarousel from '@/components/vertical-carousel';
import LikeDislikePostMessage from '@/components/newfeeds/like-dislike-post-message';
import { cn } from '@/lib/utils';
import Toast from '@/components/toast';

export default function HomeContent() {
  const locale = useLocale();
  const t = useTranslations('chat');
  const [onboardingCompleted, setOnboardingCompleted] = useLocalStorage<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETED, false);

  const { content, contentList } = CONTENTS[locale as keyof typeof CONTENTS];
  const [modalPostId, setModalPostId] = useState<string | null>(null);
  const [emblaApi, setEmblaApi] = useState<EmblaCarouselType | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const useGameStore = createGameStore({
    answers: {},
    currentQuestionIndex: 0,
    questions: contentList.map(item => item.id),
    questionStore: content,
  });

  const {
    getAnswer,
    moveToNextQuestion,
    setAnswer,
    isAnswered,
    isPostDisabled,
  } = useGameStore();
  const { credibility, setCredibility } = useCredibilityStore();

  const handleSkipClick = () => {
    setOnboardingCompleted(true);
  };

  // Stable callback for onApi to prevent infinite loops
  const handleEmblaApi = useCallback((api: EmblaCarouselType | null) => {
    setEmblaApi(api);
  }, []);

  // Track selected index for navigation buttons
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on('select', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  const selectedPostId = contentList[selectedIndex]?.id;
  const hasEngagedCurrent = selectedPostId ? isAnswered(selectedPostId) : false;
  const canGoNext = !!emblaApi?.canScrollNext();
  const canGoPrev = !!emblaApi?.canScrollPrev();
  const nextEnabled = hasEngagedCurrent && canGoNext;
  const prevEnabled = canGoPrev;

  const handleOnCloseModal = (postId: string) => {
    setModalPostId(null);
  };

  const handleOnContinueModal = (postId: string) => {
    // Check if this specific question is answered
    if (isAnswered(postId)) {
      moveToNextQuestion();
      emblaApi?.scrollNext();
    }
  };

  const handleOnAnswer = (postId: string, answer: 'like' | 'dislike') => {
    // Only allow answer if post is not already answered
    if (!isAnswered(postId)) {
      setAnswer(postId, answer);

      // Find the content item to check correctness
      const contentItem = contentList.find(item => item.id === postId) as LikeDislikeContent | undefined;
      if (contentItem && contentItem.type === ContentType.LIKE_DISLIKE) {
        const isCorrect = answer === contentItem.correctAnswer;

        // Decrease credibility if incorrect
        if (!isCorrect) {
          const newCredibility = Math.max(0, credibility - 5);
          setCredibility(newCredibility);
        }
      }

      // Show modal after answer is set
      setModalPostId(postId);
    }
  };

  useEffect(() => {
    // Set app element for react-modal accessibility
    if (typeof window !== 'undefined') {
      const rootElement = document.getElementById('root') || document.body;
      Modal.setAppElement(rootElement);
    }
  }, []);

  const handleNext = () => {
    if (!emblaApi) return;
    
    // Check if we're at the last post
    const isLastPost = selectedIndex === contentList.length - 1;
    if (isLastPost || !canGoNext) {
      setToastMessage('You\'re already on the last post');
      setShowToast(true);
      return;
    }
    
    if (!nextEnabled) {
      setToastMessage('Please engage with this post before moving to the next one');
      setShowToast(true);
      return;
    }
    
    emblaApi.scrollNext();
  };

  const handlePrevious = () => {
    if (!emblaApi) return;
    
    // Check if we're at the first post
    const isFirstPost = selectedIndex === 0;
    if (isFirstPost || !canGoPrev) {
      setToastMessage('You\'re already on the first post');
      setShowToast(true);
      return;
    }
    
    emblaApi.scrollPrev();
  };

  if (!onboardingCompleted) {
    return <ChatContent startOnboardingText={t('startOnboarding')} skipText={t('skip')} onSkipClick={handleSkipClick} />;
  }

  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-md flex-col overflow-hidden overscroll-y-contain md:max-w-none md:overflow-visible md:px-4',
        // Mobile: height matches main padding (pt-24 header+credibility + pb-16 bottom nav), not h-screen — avoids extra page scroll & top/bottom gaps
        'max-md:h-[calc(100dvh-10rem-env(safe-area-inset-bottom,0px))] max-md:min-h-0 max-md:touch-pan-y',
        'md:h-screen',
      )}
    >
      {/* overflow-visible on md so desktop nav buttons are not clipped on hover (scale + shadow) */}
      <div
        className={cn(
          'relative mx-auto flex w-full max-w-md flex-col overflow-visible md:px-1',
          'h-full min-h-0 max-md:justify-start max-md:items-stretch',
          'md:h-screen md:items-center md:justify-center',
        )}
      >
        <div
          className={cn(
            'flex min-h-0 w-full flex-1 flex-col md:h-full md:flex-row md:items-center md:justify-center md:gap-4 md:pr-1',
            'max-md:items-stretch',
          )}
        >
          {/* Carousel: fills mobile column; desktop keeps 70vh to pair with side arrows */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col items-stretch justify-stretch max-md:h-full md:h-[70vh] md:items-center md:justify-center">
            <VerticalCarousel
              options={{
                axis: 'y',
                dragFree: false,
                skipSnaps: false,
                align: 'start',
                slidesToScroll: 1,
                containScroll: 'trimSnaps',
                watchDrag: true,
              }}
              lockNext={!hasEngagedCurrent && canGoNext}
              onApi={handleEmblaApi}
            >
              {(api) => {
                return contentList.map((contentItem, index) => {
                  const likeDislikeContent = contentItem as LikeDislikeContent;
                  const isActive = api?.selectedScrollSnap() === index;
                  const answer = getAnswer(likeDislikeContent.id);
                  const isDisabled = isPostDisabled(likeDislikeContent.id);

                  return (
                    <div
                      className={cn(
                        'w-full shrink-0 transform-gpu',
                        isActive ? 'opacity-100' : 'opacity-70',
                      )}
                      style={{
                        height: '100%',
                        minHeight: '100%',
                      }}
                      key={likeDislikeContent.id}
                    >
                      <div className="flex h-full items-center justify-center overflow-y-auto">
                        <LikeDislikePostMessage
                          postId={likeDislikeContent.id}
                          user={likeDislikeContent.post.user}
                          content={likeDislikeContent.post.content}
                          mediaUrl={likeDislikeContent.post.mediaUrl}
                          mediaType={likeDislikeContent.post.mediaType}
                          answer={answer}
                          correctAnswer={likeDislikeContent.correctAnswer}
                          onLike={(postId) => handleOnAnswer(postId, 'like')}
                          onDislike={(postId) => handleOnAnswer(postId, 'dislike')}
                          isDisabled={isDisabled}
                        />
                      </div>
                    </div>
                  );
                });
              }}
            </VerticalCarousel>
          </div>

          {/* Desktop only — stays visible behind modal; overlay (z-[100]) blocks interaction */}
          <div className="relative z-10 hidden h-[70vh] shrink-0 flex-col items-center justify-center gap-4 md:flex md:py-2 md:pl-1">
            {/* Up arrow (Previous post) */}
            <button
              type="button"
              onClick={handlePrevious}
              className={cn(
                'rounded-full w-12 h-12 flex items-center justify-center',
                'transition-all shadow-lg',
                !prevEnabled
                  ? 'opacity-30 cursor-not-allowed bg-[#6B7280] hover:bg-[#6B7280]'
                  : 'hover:scale-110 active:scale-95 bg-[#011E41] hover:bg-[#002A5A] active:bg-[#001A3F] cursor-pointer'
              )}
              aria-label="Previous post"
              aria-disabled={!prevEnabled}
            >
              <ChevronUp size={24} className="text-white" strokeWidth={2.5} aria-hidden="true" />
            </button>

            {/* Down arrow (Next post) */}
            <button
              type="button"
              onClick={handleNext}
              className={cn(
                'rounded-full w-12 h-12 flex items-center justify-center',
                'transition-all shadow-lg',
                nextEnabled
                  ? 'bg-[#2FE89F] hover:bg-[#00FF9C] active:bg-[#26D68F] cursor-pointer opacity-100 hover:scale-110 active:scale-95'
                  : 'bg-[#6B7280] opacity-50 cursor-not-allowed hover:bg-[#6B7280]'
              )}
              aria-label="Next post"
              aria-disabled={!nextEnabled}
            >
              <ChevronDown size={24} className="text-[#011E41]" strokeWidth={2.5} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal - shown when a post is answered */}
      {modalPostId && (() => {
        const contentItem = contentList.find(item => item.id === modalPostId) as LikeDislikeContent | undefined;
        if (!contentItem) return null;

        const modalAnswer = getAnswer(modalPostId);
        if (!modalAnswer) return null;

        const isCorrect = modalAnswer === contentItem.correctAnswer;
        const reasonContent = isCorrect
          ? contentItem.whyCorrectAnswer.content
          : contentItem.whyIncorrectAnswer.content;
        const reasonHeader = isCorrect
          ? contentItem.whyCorrectAnswer.title
          : contentItem.whyIncorrectAnswer.title;

        return (
          <PrebunkingModal
            isOpen={true}
            onClose={() => handleOnCloseModal(modalPostId)}
            onContinue={() => handleOnContinueModal(modalPostId)}
            postId={modalPostId}
            content={reasonContent}
            header={reasonHeader}
          />
        );
      })()}

      {/* Toast notification */}
      <Toast
        message={toastMessage || ''}
        isVisible={showToast}
        onClose={() => {
          setShowToast(false);
          setToastMessage(null);
        }}
      />
    </div>
  );
}

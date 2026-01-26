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
import Toast from '@/components/toast';
import { cn } from '@/lib/utils';

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
    // Allow users to change their answer - always set the new answer
    const previousAnswer = getAnswer(postId);
    setAnswer(postId, answer);

    // Find the content item to check correctness
    const contentItem = contentList.find(item => item.id === postId) as LikeDislikeContent | undefined;
    if (contentItem && contentItem.type === ContentType.LIKE_DISLIKE) {
      const isCorrect = answer === contentItem.correctAnswer;

      // Only decrease credibility if this is a new incorrect answer
      // (not if they're changing from incorrect to correct, or if already answered correctly)
      if (!isCorrect && !previousAnswer) {
        // First time answering incorrectly
        const newCredibility = Math.max(0, credibility - 5);
        setCredibility(newCredibility);
      } else if (!isCorrect && previousAnswer && previousAnswer === contentItem.correctAnswer) {
        // Changed from correct to incorrect
        const newCredibility = Math.max(0, credibility - 5);
        setCredibility(newCredibility);
      }
    }

    // Show modal after answer is set
    setModalPostId(postId);
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
    if (!nextEnabled) {
      // Check if we're on the last post
      const isLastPost = selectedIndex === contentList.length - 1;
      if (isLastPost) {
        setToastMessage(t('noMorePosts') || "You've reached the end! 🎉 No more posts to see.");
        setShowToast(true);
      }
      return;
    }
    emblaApi.scrollNext();
  };

  const handlePrevious = () => {
    if (!emblaApi) return;
    if (!prevEnabled) {
      // Check if we're on the first post
      const isFirstPost = selectedIndex === 0;
      if (isFirstPost) {
        setToastMessage(t('earliestPost') || "This is the earliest post! 📌 You're at the beginning.");
        setShowToast(true);
      }
      return;
    }
    emblaApi.scrollPrev();
  };

  if (!onboardingCompleted) {
    return <ChatContent startOnboardingText={t('startOnboarding')} skipText={t('skip')} onSkipClick={handleSkipClick} />;
  }

  return (
    <div className="mx-auto flex flex-col md:px-4 overflow-hidden h-screen">
      <div className="mx-auto flex items-center justify-center h-screen max-w-md w-full relative overflow-hidden">
        <div className="w-full flex items-center gap-4 justify-center h-full">
          {/* Carousel Container */}
          <div className="flex-1 h-[70vh] flex items-center justify-center">
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
                  // Always allow interaction - users can change their answer
                  const isDisabled = false;

                  return (
                    <div
                      className={cn(
                        'transform-gpu flex-shrink-0 w-full',
                        isActive ? 'opacity-100' : 'opacity-70'
                      )}
                      style={{
                        height: '100%',
                        minHeight: '100%',
                      }}
                      key={likeDislikeContent.id}
                    >
                      <div
                        className="h-full flex items-center justify-center overflow-y-auto"
                        style={{ pointerEvents: 'auto', position: 'relative', zIndex: 1 }}
                      >
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

          {/* Navigation Buttons - Outside on the right */}
          <div className="flex flex-col items-center justify-center gap-4 h-[70vh]">
            {/* Up arrow (Previous post) */}
            <button
              type="button"
              onClick={handlePrevious}
              className={cn(
                'rounded-full w-12 h-12 flex items-center justify-center',
                'transition-all hover:scale-110 active:scale-95 shadow-lg',
                'bg-[#011E41] hover:bg-[#002A5A] active:bg-[#001A3F]',
                !prevEnabled
                  ? 'opacity-30 cursor-not-allowed bg-[#6B7280] hover:bg-[#6B7280]'
                  : 'cursor-pointer'
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
                'transition-all hover:scale-110 active:scale-95 shadow-lg',
                nextEnabled
                  ? 'bg-[#2FE89F] hover:bg-[#00FF9C] active:bg-[#26D68F] cursor-pointer opacity-100'
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
        onClose={() => setShowToast(false)}
        duration={3000}
      />
    </div>
  );
}

'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import ChatContent from '@/components/chat-content';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { STORAGE_KEYS } from '@/lib/local-storage';
import { useLocalStorage } from '@/lib/use-local-storage';
import PrebunkingModal from '@/components/newfeeds/prebunking-modal';
import CONTENTS from '@/contents';
import { Content, ContentType, LikeDislikeContent, MCQContent } from '@/contents/en';
import { createGameStore } from '@/lib/use-game-store';
import { useCredibilityStore } from '@/lib/use-credibility-store';
import GameComplete from '@/components/game-complete';

import Modal from 'react-modal';
import { ChevronDown, ChevronUp } from 'lucide-react';
import GameFeed, { type GameFeedHandle } from '@/components/game-feed';
import LikeDislikePostMessage from '@/components/newfeeds/like-dislike-post-message';
import MCQPostMessage from '@/components/newfeeds/mcq-post-message';
import { cn } from '@/lib/utils';
import Toast from '@/components/toast';

export default function HomeContent() {
  const locale = useLocale();
  const t = useTranslations('chat');
  const feedT = useTranslations('feed');
  const [onboardingCompleted, setOnboardingCompleted] = useLocalStorage<boolean>(
    STORAGE_KEYS.ONBOARDING_COMPLETED,
    false
  );

  const { content, contentList } = CONTENTS[locale as keyof typeof CONTENTS];
  const [modalPostId, setModalPostId] = useState<string | null>(null);
  const feedRef = useRef<GameFeedHandle>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Lazily created once: createGameStore() builds a brand-new Zustand store each call,
  // and gameCompleted/correctAnswers aren't persisted, so recreating it on every render
  // (e.g. from the state updates below) would silently reset them.
  const [useGameStore] = useState(() =>
    createGameStore({
      answers: {},
      currentQuestionIndex: 0,
      questions: contentList.map((item) => item.id),
      questionStore: content,
      gameCompleted: false,
      correctAnswers: 0,
    })
  );

  const {
    getAnswer,
    moveToNextQuestion,
    setAnswer,
    isAnswered,
    isPostDisabled,
    isGameCompleted,
    getCorrectAnswers,
    incrCorrectAnswers,
    getNumQuestions,
    resetGame,
  } = useGameStore();
  const { addPoints, increaseCredibility, decreaseCredibility, initCredibility, resetCredibility } =
    useCredibilityStore();

  useEffect(() => {
    initCredibility(contentList.length);
  }, [contentList.length, initCredibility]);

  const handleSkipClick = () => {
    setOnboardingCompleted(true);
  };

  // The feed only ever contains the answered posts plus the current question:
  // scrolling is unrestricted inside that set, and nothing beyond it exists to reach.
  const firstUnansweredIndex = contentList.findIndex((item) => !isAnswered(item.id));
  const unlockedCount = firstUnansweredIndex === -1 ? contentList.length : firstUnansweredIndex + 1;
  const unlockedPosts = useMemo(
    () => contentList.slice(0, unlockedCount),
    [contentList, unlockedCount]
  );
  const unlockedPostIds = useMemo(() => unlockedPosts.map((item) => item.id), [unlockedPosts]);
  const isFeedLocked = firstUnansweredIndex !== -1;

  const showFeedToast = useCallback(
    (message: string) => {
      setToastMessage(message);
      setShowToast(true);
    },
    [setToastMessage, setShowToast]
  );

  const handleCloseToast = useCallback(() => {
    setShowToast(false);
    setToastMessage(null);
  }, [setShowToast, setToastMessage]);

  const handleActiveIndexChange = useCallback(
    (index: number) => {
      setActiveIndex(index);
    },
    [setActiveIndex]
  );

  const handleBlockedScrollAttempt = useCallback(() => {
    showFeedToast(feedT('blockedScroll'));
  }, [feedT, showFeedToast]);

  // Returning players (persisted answers) land on their current question rather than post 1.
  const initialScrollDoneRef = useRef(false);
  useEffect(() => {
    if (initialScrollDoneRef.current || !onboardingCompleted) return;
    initialScrollDoneRef.current = true;
    if (firstUnansweredIndex > 0) {
      feedRef.current?.scrollToPost(firstUnansweredIndex);
    }
  }, [firstUnansweredIndex, onboardingCompleted]);

  const activePostId = unlockedPosts[activeIndex]?.id;
  const hasEngagedCurrent = activePostId ? isAnswered(activePostId) : false;
  const isLastPost = activeIndex >= contentList.length - 1;
  const canGoNext = activeIndex < unlockedPosts.length - 1;
  const canGoPrev = activeIndex > 0;
  const nextEnabled = hasEngagedCurrent && canGoNext;
  const prevEnabled = canGoPrev;

  const handleOnCloseModal = () => {
    setModalPostId(null);
  };

  const handleOnContinueModal = (postId: string) => {
    if (isAnswered(postId)) {
      moveToNextQuestion();
      const nextIndex = contentList.findIndex((item) => item.id === postId) + 1;
      if (nextIndex < contentList.length) {
        // The next post is rendered by now (it unlocked when the answer was stored).
        feedRef.current?.scrollToPost(nextIndex);
      }
    }
  };

  const handleOnAnswer = (postId: string, answer: string) => {
    // Only allow answer if post is not already answered and is not disabled
    if (!isAnswered(postId) && !isPostDisabled(postId)) {
      setAnswer(postId, answer);

      // Find the content item to check correctness
      const contentItem = contentList.find((item) => item.id === postId) as Content | undefined;
      if (!contentItem) return;

      const isCorrect =
        contentItem.type === ContentType.MCQ
          ? answer === (contentItem as MCQContent).correctOptionId
          : answer === (contentItem as LikeDislikeContent).correctAnswer;

      if (isCorrect) {
        increaseCredibility();
        addPoints(5);
        incrCorrectAnswers();
      } else {
        decreaseCredibility();
      }

      // Show modal after answer is set
      setModalPostId(postId);
    }
  };

  const handleRestartSimulation = () => {
    resetGame();
    resetCredibility(contentList.length);
    setOnboardingCompleted(false);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const rootElement = document.getElementById('root') || document.body;
      Modal.setAppElement(rootElement);
    }
  }, []);

  const handleNext = () => {
    if (isLastPost) {
      showFeedToast(feedT('alreadyLast'));
      return;
    }

    if (!nextEnabled) {
      showFeedToast(feedT('answerToContinue'));
      return;
    }

    feedRef.current?.scrollToPost(activeIndex + 1);
  };

  const handlePrevious = () => {
    if (!canGoPrev) {
      showFeedToast(feedT('alreadyFirst'));
      return;
    }

    feedRef.current?.scrollToPost(activeIndex - 1);
  };

  if (!onboardingCompleted) {
    return (
      <ChatContent
        startOnboardingText={t('startOnboarding')}
        skipText={t('skip')}
        onSkipClick={handleSkipClick}
      />
    );
  }

  if (isGameCompleted()) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] flex-col p-4 items-center justify-center max-md:mb-16">
        <GameComplete
          correctAnswers={getCorrectAnswers()}
          totalQuestions={getNumQuestions()}
          restartGame={handleRestartSimulation}
        />
      </div>
    );
  }

  const renderPost = (_postId: string, index: number) => {
    const contentItem = unlockedPosts[index] as Content | undefined;
    if (!contentItem) return null;
    const answer = getAnswer(contentItem.id);
    const isDisabled = isPostDisabled(contentItem.id);

    if (contentItem.type === ContentType.MCQ) {
      const mcq = contentItem as MCQContent;
      return (
        <MCQPostMessage
          postId={mcq.id}
          user={mcq.post.user}
          content={mcq.post.content}
          mediaUrl={mcq.post.mediaUrl}
          mediaType={mcq.post.mediaType}
          options={mcq.options}
          correctOptionId={mcq.correctOptionId}
          answer={answer}
          isDisabled={isDisabled}
          onAnswer={handleOnAnswer}
        />
      );
    }

    if (contentItem.type === ContentType.LIKE_DISLIKE) {
      const likeDislike = contentItem as LikeDislikeContent;
      return (
        <LikeDislikePostMessage
          postId={likeDislike.id}
          user={likeDislike.post.user}
          content={likeDislike.post.content}
          mediaUrl={likeDislike.post.mediaUrl}
          mediaType={likeDislike.post.mediaType}
          answer={answer as 'like' | 'dislike' | null | undefined}
          correctAnswer={likeDislike.correctAnswer}
          onLike={(id) => handleOnAnswer(id, 'like')}
          onDislike={(id) => handleOnAnswer(id, 'dislike')}
          isDisabled={isDisabled}
        />
      );
    }

    return null;
  };

  return (
    <div
      className={cn(
        'mx-auto flex w-full flex-col p-4',
        // Mobile: exactly the space between the fixed header/credibility bar (6rem) and the
        // bottom nav (4rem + safe area). The feed itself is the only thing that scrolls.
        'max-md:h-[calc(100vh-10rem)] max-md:h-[calc(100dvh-10rem-env(safe-area-inset-bottom,0px))]',
        'max-md:max-w-md max-md:min-h-0',
        // Desktop: fill the viewport below the header so tall posts get as much room as possible.
        'md:h-[calc(100vh-6rem)] md:h-[calc(100dvh-6rem)] md:max-w-none'
      )}
    >
      <div
        className={cn(
          'mx-auto flex h-full min-h-0 w-full max-w-md flex-col',
          'md:max-w-none md:items-center md:justify-center'
        )}
      >
        <div
          className={cn(
            'flex h-full min-h-0 w-full flex-1 flex-col',
            'md:w-auto md:flex-row md:items-stretch md:justify-center md:gap-4'
          )}
        >
          {/* Feed column; the toast is anchored here so it is centred under the post, not the viewport */}
          <div className="relative flex min-h-0 w-full flex-1 flex-col md:w-[28rem] md:max-w-[calc(100vw-12rem)]">
            <GameFeed
              ref={feedRef}
              postIds={unlockedPostIds}
              renderPost={renderPost}
              isLocked={isFeedLocked}
              labels={{
                scrollHint: feedT('scrollHint'),
                lockedHint: feedT('lockedHint'),
              }}
              onActiveIndexChange={handleActiveIndexChange}
              onBlockedScrollAttempt={handleBlockedScrollAttempt}
            />

            <Toast
              message={toastMessage || ''}
              isVisible={showToast}
              onClose={handleCloseToast}
              className="absolute bottom-4 left-1/2 z-40 mx-0 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2"
            />
          </div>

          {/* Desktop only — stays visible behind modal; overlay (z-[100]) blocks interaction */}
          <div className="relative z-10 hidden h-full shrink-0 flex-col items-center justify-center gap-4 md:flex md:py-2 md:pl-1">
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
              <ChevronDown
                size={24}
                className="text-[#011E41]"
                strokeWidth={2.5}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Modal - shown when a post is answered */}
      {modalPostId &&
        (() => {
          const contentItem = contentList.find((item) => item.id === modalPostId) as
            Content | undefined;
          if (!contentItem) return null;

          const modalAnswer = getAnswer(modalPostId);
          if (!modalAnswer) return null;

          const isCorrect =
            contentItem.type === ContentType.MCQ
              ? modalAnswer === (contentItem as MCQContent).correctOptionId
              : modalAnswer === (contentItem as LikeDislikeContent).correctAnswer;
          const reasonContent = isCorrect
            ? contentItem.whyCorrectAnswer.content
            : contentItem.whyIncorrectAnswer.content;
          const reasonHeader = isCorrect
            ? contentItem.whyCorrectAnswer.title
            : contentItem.whyIncorrectAnswer.title;

          return (
            <PrebunkingModal
              isOpen={true}
              onClose={handleOnCloseModal}
              onContinue={() => handleOnContinueModal(modalPostId)}
              postId={modalPostId}
              content={reasonContent}
              header={reasonHeader}
              isCorrect={isCorrect}
            />
          );
        })()}
    </div>
  );
}

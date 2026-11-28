'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import ChatContent from '@/components/chat-content';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { defaultAlexChatState, STORAGE_KEYS, storage } from '@/lib/local-storage';
import { useLocalStorage } from '@/lib/use-local-storage';
import { useAlexChat } from '@/lib/use-alex-chat';
import PrebunkingModal from '@/components/newfeeds/prebunking-modal';
import CONTENTS from '@/contents';
import { type Content, ContentType } from '@/contents/en';
import { createGameStore, getQuizScore } from '@/lib/use-game-store';
import { useCredibilityStore } from '@/lib/use-credibility-store';
import { useProfileStore } from '@/lib/use-profile-store';
import GameComplete from '@/components/game-complete';
import { Link } from '@/i18n/routing';

import Modal from 'react-modal';
import { ChevronDown, ChevronUp } from 'lucide-react';
import GameFeed, { type GameFeedHandle } from '@/components/game-feed';
import LikeDislikePostMessage from '@/components/newfeeds/like-dislike-post-message';
import MCQPostMessage from '@/components/newfeeds/mcq-post-message';
import ShareQuestionPost, { ShareQuestionFeedback } from '@/components/newfeeds/share-question-post';
import { CommentQuestionDialog, CommentQuestionPost } from '@/components/newfeeds/comment-question';
import { cn } from '@/lib/utils';
import Toast from '@/components/toast';

function isCorrectAnswer(question: Content, answer: string) {
  if (question.type === ContentType.MCQ || question.type === ContentType.COMMENT) {
    return answer === question.correctOptionId;
  }

  return answer === question.correctAnswer;
}

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
  const [alexChat, setAlexChat] = useAlexChat();
  const resetProfile = useProfileStore((state) => state.resetProfile);
  const alexNoticeSent = useRef(false);

  useEffect(() => {
    if (alexChat.notified || alexChat.reply) alexNoticeSent.current = true;
  }, [alexChat]);

  // Keep the feed store stable across renders and let it restore any saved session.
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
    finishGame,
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
  const isFinalCommentQuestion =
    firstUnansweredIndex === contentList.length - 1 &&
    contentList[firstUnansweredIndex]?.type === ContentType.COMMENT;
  const feedFinished = contentList.length > 0 && !isFeedLocked;
  const readyForResults = feedFinished && !modalPostId;
  const alexPending = alexChat.reply === null;
  const gameCompleted = isGameCompleted();
  const shouldFinishGame = readyForResults && !alexPending && !gameCompleted;

  useEffect(() => {
    if (onboardingCompleted && shouldFinishGame) finishGame();
  }, [onboardingCompleted, shouldFinishGame, finishGame]);

  const showFeedToast = useCallback((message: string) => {
    setToastMessage(message);
    setShowToast(true);
  }, []);

  const handleCloseToast = useCallback(() => {
    setShowToast(false);
    setToastMessage(null);
  }, []);

  const handleActiveIndexChange = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const handleBlockedScrollAttempt = useCallback(() => {
    showFeedToast(feedT('blockedScroll'));
  }, [feedT, showFeedToast]);

  const activePostId = unlockedPosts[activeIndex]?.id;
  const hasEngagedCurrent = activePostId ? isAnswered(activePostId) : false;
  const isLastPost = activeIndex >= contentList.length - 1;
  const canGoNext = activeIndex < unlockedPosts.length - 1;
  const canGoPrev = activeIndex > 0;
  const nextEnabled = hasEngagedCurrent && canGoNext;
  const prevEnabled = canGoPrev;

  const maybeNotifyAlex = (postId: string) => {
    if (postId !== contentList[2]?.id) return;
    if (alexNoticeSent.current || alexChat.notified || alexChat.reply) return;
    alexNoticeSent.current = true;
    setAlexChat({ notified: true, reply: null });
  };

  const handleOnCloseModal = () => {
    if (modalPostId) maybeNotifyAlex(modalPostId);
    setModalPostId(null);
  };

  const handleOnContinueModal = (postId: string) => {
    if (!isAnswered(postId)) return;

    const nextIndex = contentList.findIndex((item) => item.id === postId) + 1;
    if (nextIndex >= contentList.length) return;

    moveToNextQuestion();
    // The next post is rendered by now (it unlocked when the answer was stored).
    feedRef.current?.scrollToPost(nextIndex);
  };

  const handleViewResults = () => {
    if (finishGame() && alexPending) setAlexChat(defaultAlexChatState);
  };

  const handleOpenAlex = () => {
    // Older saved sessions can reach the end without dismissing the third post's feedback.
    if (!alexChat.notified) setAlexChat({ notified: true, reply: null });
  };

  const handleOnAnswer = (postId: string, answer: string) => {
    const question: Content | undefined = contentList.find((item) => item.id === postId);
    if (!question || isAnswered(postId) || isPostDisabled(postId)) return;
    if (setAnswer(postId, answer) === false) return;

    if (isCorrectAnswer(question, answer)) {
      increaseCredibility();
      addPoints(5);
      incrCorrectAnswers();
    } else {
      decreaseCredibility();
    }

    setModalPostId(postId);
  };

  const handleRestartSimulation = () => {
    resetGame();
    resetCredibility(contentList.length);
    // FR9: Restart simulation also returns the player to the default username and avatar.
    resetProfile();
    storage.removeItem(STORAGE_KEYS.CHAT_ONBOARDING_STATE);
    setOnboardingCompleted(false);
    alexNoticeSent.current = false;
    setAlexChat(defaultAlexChatState);
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

  if (gameCompleted || shouldFinishGame) {
    return (
      <div className="flex min-h-[calc(100dvh-10rem)] flex-col items-center justify-center p-4 md:min-h-[calc(100vh-6rem)]">
        <GameComplete
          {...getQuizScore(getCorrectAnswers(), getNumQuestions(), alexChat.reply)}
          restartGame={handleRestartSimulation}
        />
      </div>
    );
  }

  const renderPost = (_postId: string, index: number) => {
    const contentItem: Content | undefined = unlockedPosts[index];
    if (!contentItem) return null;
    const answer = getAnswer(contentItem.id);
    const isDisabled = isPostDisabled(contentItem.id);

    if (contentItem.type === ContentType.MCQ) {
      const mcq = contentItem;
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
      const likeDislike = contentItem;
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

    if (contentItem.type === ContentType.SHARE) {
      return (
        <ShareQuestionPost
          question={contentItem}
          answer={answer}
          disabled={isDisabled}
          onAnswer={handleOnAnswer}
        />
      );
    }

    if (contentItem.type === ContentType.COMMENT) {
      return (
        <CommentQuestionPost
          question={contentItem}
          answered={answer !== null}
          disabled={isDisabled}
          onOpen={() => setModalPostId(contentItem.id)}
        />
      );
    }

    return null;
  };

  const modalQuestion: Content | undefined = contentList.find((item) => item.id === modalPostId);
  const modalAnswer = modalQuestion ? getAnswer(modalQuestion.id) : null;
  const isModalAnswerCorrect =
    modalQuestion && modalAnswer ? isCorrectAnswer(modalQuestion, modalAnswer) : null;
  const modalFeedback = isModalAnswerCorrect
    ? modalQuestion?.whyCorrectAnswer
    : modalQuestion?.whyIncorrectAnswer;

  const completionActions = readyForResults && alexPending && (
    <section
      aria-label={feedT('feedComplete')}
      className="mx-auto grid w-full max-w-sm grid-cols-2 gap-3 text-center text-sm"
    >
      <button
        type="button"
        onClick={handleViewResults}
        className="min-h-11 rounded-full bg-[#011E41] px-3 py-2 font-semibold text-white transition-colors hover:bg-[#002552] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#011E41]"
      >
        {feedT('viewResults')}
      </button>
      <Link
        href="/chat/alex"
        onClick={handleOpenAlex}
        className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#011E41] px-3 py-2 font-semibold text-[#011E41] transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#011E41]"
      >
        {feedT('openAlexMessage')}
      </Link>
    </section>
  );

  return (
    <div
      className={cn(
        'flex w-full flex-col p-4',
        // Mobile: pin the feed between the fixed header/credibility bar (6rem) and the fixed
        // bottom nav (4rem). Fixed edges track the real visible viewport on iOS Safari, unlike
        // vh/dvh maths, so the feed never overshoots or leaves a gap above the nav.
        'max-md:fixed max-md:inset-x-0 max-md:top-24 max-md:bottom-16 max-md:mx-auto max-md:max-w-md',
        // Desktop: fill the viewport below the header so tall posts get as much room as possible.
        'md:mx-auto md:h-[calc(100vh-6rem)] md:h-[calc(100dvh-6rem)] md:max-w-none'
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
            'md:w-auto md:flex-row md:items-stretch md:justify-center md:gap-4',
            modalQuestion?.type === ContentType.COMMENT &&
              'lg:ltr:-translate-x-[11.5rem] lg:rtl:translate-x-[11.5rem]'
          )}
        >
          {/* Feed column; the toast is anchored here so it is centred under the post, not the viewport */}
          <div className="relative flex min-h-0 w-full flex-1 flex-col md:w-[28rem] md:max-w-[calc(100vw-12rem)]">
            <GameFeed
              ref={feedRef}
              // Returning players (persisted answers) land on their current question.
              initialIndex={isFeedLocked ? firstUnansweredIndex : unlockedPosts.length - 1}
              postIds={unlockedPostIds}
              renderPost={(postId, index) => {
                const post = renderPost(postId, index);
                if (!completionActions || index !== contentList.length - 1) return post;

                return (
                  <div className="my-auto flex shrink-0 flex-col gap-3 max-md:pb-[max(0px,calc(var(--mobile-feed-bottom,4rem)-4.5rem))]">
                    {post}
                    {completionActions}
                  </div>
                );
              }}
              isLocked={isFeedLocked}
              labels={{
                scrollHint: feedT('scrollHint'),
                lockedHint: feedT(isFinalCommentQuestion ? 'finishFeedHint' : 'lockedHint'),
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

          {/* On wide screens the comments panel occupies the space beside the post. */}
          <div
            className={cn(
              'relative z-10 hidden h-full shrink-0 flex-col items-center justify-center gap-4 md:flex md:py-2 md:pl-1',
              modalQuestion?.type === ContentType.COMMENT && 'lg:hidden'
            )}
          >
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

      {modalQuestion?.type === ContentType.COMMENT ? (
        <CommentQuestionDialog
          question={modalQuestion}
          answer={modalAnswer}
          onAnswer={handleOnAnswer}
          onClose={handleOnCloseModal}
          onContinue={() => {
            handleOnContinueModal(modalQuestion.id);
            handleOnCloseModal();
          }}
        />
      ) : modalQuestion && modalFeedback && isModalAnswerCorrect !== null ? (
        <PrebunkingModal
          isOpen
          onClose={handleOnCloseModal}
          onContinue={() => handleOnContinueModal(modalQuestion.id)}
          postId={modalQuestion.id}
          content={
            modalQuestion.type === ContentType.SHARE ? (
              <ShareQuestionFeedback
                question={modalQuestion}
                shared={modalAnswer === 'share'}
                explanation={modalFeedback.content}
              />
            ) : (
              modalFeedback.content
            )
          }
          header={modalFeedback.title}
          isCorrect={isModalAnswerCorrect}
        />
      ) : null}
    </div>
  );
}

'use client';

import React, { useEffect, useRef, useState } from 'react';
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
import ContentCarouselItems from '@/components/content-carousel-items';
import GameComplete from '@/components/game-complete';

import Modal from 'react-modal';
import { CarouselApi } from '@/components/ui/carousel';

import {
  Carousel,
} from "@/components/ui/carousel"

export default function HomeContent() {
  const locale = useLocale();
  const t = useTranslations('chat');
  const [onboardingCompleted, setOnboardingCompleted] = useLocalStorage<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETED, false);
  const { content, contentList } = CONTENTS[locale as keyof typeof CONTENTS];
  const [modalPostId, setModalPostId] = useState<string | null>(null);
  const modalDataRef = useRef<{
    postId: string;
    content: React.ReactNode;
    header: React.ReactNode;
  } | null>(null);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const useGameStore = createGameStore({
    answers: {},
    currentQuestionIndex: 0,
    questions: contentList.map(item => item.id),
    questionStore: content,
    gameCompleted: false,
    correctAnswers: 0
  });
  
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
    resetGame
  } = useGameStore();
  const { credibility, setCredibility, resetCredibility } = useCredibilityStore();

  const handleSkipClick = () => {
    setOnboardingCompleted(true);
  };

  const handleOnCloseModal = (postId: string) => {
    setModalPostId(null);
    
    // Check if this specific question is answered
    if (isAnswered(postId)) {
      moveToNextQuestion();
      carouselApi?.scrollNext();
    }
  };


  const handleOnAnswer = (postId: string, answer: 'like' | 'dislike') => {
    // Only allow answer if post is not already answered and is not disabled
    if (!isAnswered(postId) && !isPostDisabled(postId)) {
      setAnswer(postId, answer);
      
      // Find the content item to check correctness
      const contentItem = contentList.find(item => item.id === postId) as LikeDislikeContent | undefined;
      if (contentItem && contentItem.type === ContentType.LIKE_DISLIKE) {
        const isCorrect = answer === contentItem.correctAnswer;
        
        // Decrease credibility if incorrect
        if (!isCorrect) {
          const newCredibility = Math.max(0, credibility - 5);
          setCredibility(newCredibility);
        } else {
          incrCorrectAnswers();
        }
      }
      
      // Show modal after answer is set
      setModalPostId(postId);
    }
  };

  const handleRestartSimulation = () => {
    resetGame();
    resetCredibility();
    setOnboardingCompleted(false);
  }
  
  useEffect(() => {
    // Set app element for react-modal accessibility
    if (typeof window !== 'undefined') {
      const rootElement = document.getElementById('root') || document.body;
      Modal.setAppElement(rootElement);
    }
  }, []);

  if (!onboardingCompleted) {
    return <ChatContent startOnboardingText={t('startOnboarding')} skipText={t('skip')} onSkipClick={handleSkipClick} />;
  }

  if(isGameCompleted()) {
    return (
      <div className="flex min-h-[calc(100vh-6rem)] flex-col py-4 items-center justify-center">
        <GameComplete 
          correctAnswers={getCorrectAnswers()} 
          totalQuestions={getNumQuestions()} 
          restartGame={handleRestartSimulation} 
        />
      </div>
    );
  }

  // return <CarouselOrientation />;
  return (
    <div className="mx-auto flex flex-col md:px-4 pt-6 overflow-hidden">
        <Carousel
          opts={{
            align: "start",
            dragFree: true,
          }}
          orientation="vertical"
          className="mx-auto h-[calc(100dvh-var(--spacing)*46)] md:h-[calc(100vh-var(--spacing)*30)] max-w-md w-full relative overflow-hidden"
          setApi={setCarouselApi}
        >
          <ContentCarouselItems
            contentList={contentList as LikeDislikeContent[]}
            getAnswer={getAnswer}
            isPostDisabled={isPostDisabled}
            onAnswer={handleOnAnswer}
          />
        </Carousel>
      
      {/* Modal - shown when a post is answered. Always rendered (never remounts) so
          react-modal doesn't warn about double-registration in StrictMode. */}
      {(() => {
        if (modalPostId) {
          const contentItem = contentList.find(item => item.id === modalPostId) as LikeDislikeContent | undefined;
          const modalAnswer = getAnswer(modalPostId);
          if (contentItem && modalAnswer) {
            const isCorrect = modalAnswer === contentItem.correctAnswer;
            modalDataRef.current = {
              postId: modalPostId,
              content: isCorrect ? contentItem.whyCorrectAnswer.content : contentItem.whyIncorrectAnswer.content,
              header: isCorrect ? contentItem.whyCorrectAnswer.title : contentItem.whyIncorrectAnswer.title,
            };
          }
        }
        if (!modalDataRef.current) return null;
        const { postId, content, header } = modalDataRef.current;
        return (
          <PrebunkingModal
            isOpen={modalPostId !== null}
            onClose={() => handleOnCloseModal(postId)}
            postId={postId}
            content={content}
            header={header}
          />
        );
      })()}
    </div>
  );
}

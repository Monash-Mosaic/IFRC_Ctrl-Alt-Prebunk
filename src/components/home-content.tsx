'use client';

import { useEffect, useState } from 'react';
import ChatContent from '@/components/chat-content';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { STORAGE_KEYS } from '@/lib/local-storage';
import { useLocalStorage } from '@/lib/use-local-storage';
import LikeDislikePostMessage from '@/components/newfeeds/like-dislike-post-message';
import PrebunkingModal from '@/components/newfeeds/prebunking-modal';
import CONTENTS from '@/contents';
import { ContentType, LikeDislikeContent } from '@/contents/en';
import { useGameStore } from '@/lib/use-game-store';
import { useCredibilityStore } from '@/lib/use-credibility-store';
import Modal from 'react-modal';


export default function HomeContent() {
  const locale = useLocale();
  const t = useTranslations('chat');
  const [onboardingCompleted, setOnboardingCompleted] = useLocalStorage<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETED, false);
  
  const { contentList } = CONTENTS[locale as keyof typeof CONTENTS];
  const [modalPostId, setModalPostId] = useState<string | null>(null);
  
  const { 
    getAnswer, 
    moveToNextQuestion,
    setAnswer,
    isAnswered,
    currentQuestionIndex
  } = useGameStore();
  const { credibility, setCredibility } = useCredibilityStore();

  const handleSkipClick = () => {
    setOnboardingCompleted(true);
  };

  const handleOnCloseModal = (postId: string) => {
    setModalPostId(null);
    
    // Check if this specific question is answered
    if (isAnswered(postId)) {
      // Find the original index in contentList for store tracking
      const answeredQuestionIndex = contentList.findIndex(item => item.id === postId);
      
      if (answeredQuestionIndex !== -1) {
        // Update currentQuestionIndex to match the answered question
        // This ensures the store tracks the correct question before moving forward
        const store = useGameStore.getState();
        if (store.currentQuestionIndex !== answeredQuestionIndex) {
          // Directly update the store's currentQuestionIndex
          useGameStore.setState({ currentQuestionIndex: answeredQuestionIndex });
        }
        
        // Now move to next question (this will increment from the correct index)
        moveToNextQuestion(contentList);
      }
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

  if (!onboardingCompleted) {
    return <ChatContent startOnboardingText={t('startOnboarding')} skipText={t('skip')} onSkipClick={handleSkipClick} />;
  }

  return (
    <div className="mx-auto flex flex-col md:px-4 pt-6 overflow-hidden">
      <div className="mx-auto flex items-start justify-start max-w-md flex-col w-full relative overflow-hidden">
        <div className="flex flex-col gap-4">
          {contentList
            .map((contentItem) => {
              const likeDislikeContent = contentItem as LikeDislikeContent;
              const answer = getAnswer(likeDislikeContent.id);
              
              return (
                <div key={likeDislikeContent.id} className="pt-4">
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
                  />
                </div>
              );
            })}
        </div>
      </div>
      
      {/* Modal - shown when a post is answered */}
      {modalPostId && (() => {
        const contentItem = contentList.find(item => item.id === modalPostId) as LikeDislikeContent | undefined;
        if (!contentItem || contentItem.type !== ContentType.LIKE_DISLIKE) return null;
        
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
            postId={modalPostId}
            content={reasonContent}
            header={reasonHeader}
          />
        );
      })()}
    </div>
  );
}

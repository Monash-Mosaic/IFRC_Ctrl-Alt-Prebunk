'use client';

import ChatContent from '@/components/chat-content';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { STORAGE_KEYS } from '@/lib/local-storage';
import { useLocalStorage } from '@/lib/use-local-storage';
import LikeDislikePostMessage from '@/components/newfeeds/like-dislike-post-message';
import CONTENTS from '@/contents';
import { ContentType } from '@/contents/en';
import VerticalCarousel from '@/components/vertical-carousel';
import { cn } from '@/lib/utils';



export default function HomeContent() {
  const locale = useLocale();
  const t = useTranslations('chat');
  const [onboardingCompleted, setOnboardingCompleted] = useLocalStorage<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETED, false);
  
  const { contentList } = CONTENTS[locale as keyof typeof CONTENTS];

  const handleSkipClick = () => {
    setOnboardingCompleted(true);
  };

  const handleOnCloseModal = (postId: string) => {
    console.log('onCloseModal', postId);
  };

  const handleOnAnswer = (postId: string, answer: 'like' | 'dislike') => {
    console.log('onAnswer', postId, answer);
  };
  
  if (!onboardingCompleted) {
    return <ChatContent startOnboardingText={t('startOnboarding')} skipText={t('skip')} onSkipClick={handleSkipClick} />;
  }

  return (
    <div className="mx-auto flex flex-col md:px-4 pt-6 overflow-hidden">
      {/* <div className='flex justify-center items-center text-2xl font-bold text-[#011E41] pt-4'>{t('title')}</div> */}
      <div className="mx-auto flex items-start justify-start h-[calc(100dvh-var(--spacing)*46)] md:h-[calc(100vh-var(--spacing)*30)] max-w-md flex-col w-full relative overflow-hidden">
        <VerticalCarousel
          options={{
            axis: 'y', dragFree: true
          }}
        >
          {(emblaApi) => {
            return contentList.flatMap((contentItem, index) => {
              const isDisable = emblaApi?.selectedScrollSnap() === index;
              return (
                <div className={cn(`transform-gpu flex-[0_0_70%] h-full pt-4`, isDisable ? 'opacity-100' : 'opacity-70')} key={index}>
                  {
                    contentItem.type === ContentType.LIKE_DISLIKE && <LikeDislikePostMessage
                      key={`${contentItem.id}-like-dislike`}
                      postId={contentItem.id}
                      user={contentItem.post.user}
                      content={contentItem.post.content}
                      mediaUrl={contentItem.post.mediaUrl}
                      mediaType={contentItem.post.mediaType as 'image' | 'video'}
                      answer={null}
                      correctAnswer={contentItem.correctAnswer}
                      reasonContent={contentItem.whyCorrectAnswer.content}
                      reasonHeader={contentItem.whyCorrectAnswer.title}
                      onLike={(postId) => handleOnAnswer(postId, 'like')}
                      onDislike={(postId) => handleOnAnswer(postId, 'dislike')}
                      onCloseModal={(postId) => handleOnCloseModal(postId)}
                    />}
                </div>
              )
            });
          }}
        </VerticalCarousel>
      </div>
    </div>
  );
}

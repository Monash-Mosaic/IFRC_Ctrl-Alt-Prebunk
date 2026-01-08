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



export default function HomeContent() {
  const locale = useLocale();
  const t = useTranslations('chat');
  const [onboardingCompleted, setOnboardingCompleted] = useLocalStorage<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETED, false);
  const post = POSTS[locale];
  const messages = [
    {
      id: '1',
      type: 'post',
      post: {
        name: 'Echo Post 1',
        handle: '@echo',
        contentKey: post.echoPost,
        mediaUrl: '/images/example/echo-post-img.jpg',
        mediaType: 'image',
      },
    },
    {
      id: '2',
      type: 'post',
      post: {
        name: 'Echo Post 2',
        handle: '@echo',
        contentKey: post.echoPost,
        mediaUrl: '/images/example/echo-post-img.jpg',
        mediaType: 'image',
      },
    },
    {
      id: '3',
      type: 'post',
      post: {
        name: 'Echo Post 3',
        handle: '@echo',
        contentKey: post.echoPost,
        mediaUrl: '/images/example/echo-post-img.jpg',
        mediaType: 'image',
      },
    },
  ];

  const handleSkipClick = () => {
    setOnboardingCompleted(true);
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
            return messages.map((message, index) => {
              const isDisable = emblaApi?.selectedScrollSnap() === index;
              return (
                <div className={cn(`transform-gpu flex-[0_0_70%] h-full pt-4`, isDisable ? 'opacity-100' : 'opacity-70')} key={message.id}>
                  <LikeDislikePostMessage
                    postId={message.id}
                    name={message.post.name}
                    handle={message.post.handle}
                    content={message.post.contentKey}
                    mediaUrl={message.post.mediaUrl}
                    mediaType={message.post.mediaType as 'image' | 'video'}
                  />
                </div>
              )
            });
          }}
        </VerticalCarousel>
      </div>
    </div>
  );
}

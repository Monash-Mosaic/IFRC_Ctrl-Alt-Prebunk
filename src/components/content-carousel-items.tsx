'use client';

import { CarouselContent, CarouselItem } from "@/components/ui/carousel";
import LikeDislikePostMessage from '@/components/newfeeds/like-dislike-post-message';
import { LikeDislikeContent } from '@/contents/en';
import { GameAnswer } from '@/lib/use-game-store';

interface ContentCarouselItemsProps {
  contentList: LikeDislikeContent[];
  getAnswer: (postId: string) => GameAnswer | null | undefined;
  isPostDisabled: (postId: string) => boolean;
  onAnswer: (postId: string, answer: GameAnswer) => void;
}

export default function ContentCarouselItems({
  contentList,
  getAnswer,
  isPostDisabled,
  onAnswer,
}: ContentCarouselItemsProps) {
  return (
    <CarouselContent className="w-full p-2">
      {contentList.map((contentItem, index) => {
        const likeDislikeContent = contentItem as LikeDislikeContent;
        const answer = getAnswer(likeDislikeContent.id);
        const isDisabled = isPostDisabled(likeDislikeContent.id);
        return (
          <CarouselItem key={index} className="pt-2">
            <LikeDislikePostMessage 
              key={likeDislikeContent.id} 
              postId={likeDislikeContent.id}
              user={likeDislikeContent.post.user}
              content={likeDislikeContent.post.content}
              mediaUrl={likeDislikeContent.post.mediaUrl} 
              mediaType={likeDislikeContent.post.mediaType}
              answer={answer}
              correctAnswer={likeDislikeContent.correctAnswer} 
              onLike={(postId) => onAnswer(postId, 'like')} 
              onDislike={(postId) => onAnswer(postId, 'dislike')}
              onShare={(postId) => onAnswer(postId, 'share')}
              isDisabled={isDisabled}
            />
          </CarouselItem>
        );
      })}
    </CarouselContent>
  );
}

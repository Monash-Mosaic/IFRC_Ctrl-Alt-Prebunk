'use client';

import { CarouselContent, CarouselItem } from "@/components/ui/carousel";
import LikeDislikePostMessage from '@/components/newfeeds/like-dislike-post-message';
import MCQPostMessage from '@/components/newfeeds/mcq-post-message';
import { Content, ContentType, LikeDislikeContent, MCQContent } from '@/contents/en';

interface ContentCarouselItemsProps {
  contentList: Content[];
  getAnswer: (postId: string) => string | null | undefined;
  isPostDisabled: (postId: string) => boolean;
  onAnswer: (postId: string, answer: string) => void;
  onContinue: (postId: string) => void;
}

export default function ContentCarouselItems({
  contentList,
  getAnswer,
  isPostDisabled,
  onAnswer,
  onContinue,
}: ContentCarouselItemsProps) {
  return (
    <CarouselContent className="w-full p-2">
      {contentList.map((contentItem, index) => {
        const answer = getAnswer(contentItem.id);
        const isDisabled = isPostDisabled(contentItem.id);

        if (contentItem.type === ContentType.MCQ) {
          const mcq = contentItem as MCQContent;
          return (
            <CarouselItem key={index} className="pt-2">
              <MCQPostMessage
                postId={mcq.id}
                user={mcq.post.user}
                content={mcq.post.content}
                options={mcq.options}
                correctOptionId={mcq.correctOptionId}
                answer={answer}
                whyCorrectAnswer={mcq.whyCorrectAnswer}
                whyIncorrectAnswer={mcq.whyIncorrectAnswer}
                isDisabled={isDisabled}
                onAnswer={onAnswer}
                onContinue={onContinue}
              />
            </CarouselItem>
          );
        }

        const likeDislike = contentItem as LikeDislikeContent;
        return (
          <CarouselItem key={index} className="pt-2">
            <LikeDislikePostMessage
              postId={likeDislike.id}
              user={likeDislike.post.user}
              content={likeDislike.post.content}
              mediaUrl={likeDislike.post.mediaUrl}
              mediaType={likeDislike.post.mediaType}
              answer={answer as 'like' | 'dislike' | null}
              correctAnswer={likeDislike.correctAnswer}
              onLike={(postId) => onAnswer(postId, 'like')}
              onDislike={(postId) => onAnswer(postId, 'dislike')}
              isDisabled={isDisabled}
            />
          </CarouselItem>
        );
      })}
    </CarouselContent>
  );
}

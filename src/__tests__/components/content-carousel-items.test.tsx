import React from 'react';
import { render, screen } from '@/test-utils/test-utils';
import ContentCarouselItems from '@/components/content-carousel-items';
import { Carousel } from '@/components/ui/carousel';

jest.mock('@/components/newfeeds/like-dislike-post-message', () => {
  return function MockLikeDislikePostMessage({
    postId,
    answer,
    onLike,
    onDislike,
    isDisabled,
  }: {
    postId: string;
    answer: string | null;
    onLike?: (id: string) => void;
    onDislike?: (id: string) => void;
    isDisabled?: boolean;
  }) {
    return (
      <div data-testid={`carousel-post-${postId}`} data-disabled={String(isDisabled)}>
        <span data-testid={`carousel-answer-${postId}`}>{answer ?? 'none'}</span>
        <button type="button" onClick={() => onLike?.(postId)}>
          Like {postId}
        </button>
        <button type="button" onClick={() => onDislike?.(postId)}>
          Dislike {postId}
        </button>
      </div>
    );
  };
});

const contentList = [
  {
    id: 'post-1',
    type: 'like_dislike' as const,
    post: {
      id: 'post-1',
      user: {
        id: 'echo',
        name: 'Echo',
        handle: '@echo',
        avatar: null,
        isUser: false,
      },
      content: <div>First post</div>,
      mediaUrl: '/images/post-1.jpg',
      mediaType: 'image' as const,
    },
    correctAnswer: 'like' as const,
    whyCorrectAnswer: { title: <div>Correct</div>, content: <div>Because</div> },
    whyIncorrectAnswer: { title: <div>Incorrect</div>, content: <div>Try again</div> },
  },
  {
    id: 'post-2',
    type: 'like_dislike' as const,
    post: {
      id: 'post-2',
      user: {
        id: 'alex',
        name: 'Alex',
        handle: '@alex',
        avatar: null,
        isUser: false,
      },
      content: <div>Second post</div>,
      mediaUrl: '/images/post-2.jpg',
      mediaType: 'image' as const,
    },
    correctAnswer: 'dislike' as const,
    whyCorrectAnswer: { title: <div>Correct</div>, content: <div>Because</div> },
    whyIncorrectAnswer: { title: <div>Incorrect</div>, content: <div>Try again</div> },
  },
];

describe('ContentCarouselItems', () => {
  it('renders a carousel item for each content entry', () => {
    render(
      <Carousel>
        <ContentCarouselItems
          contentList={contentList}
          getAnswer={() => null}
          isPostDisabled={() => false}
          onAnswer={jest.fn()}
        />
      </Carousel>,
    );

    expect(screen.getByTestId('carousel-post-post-1')).toBeInTheDocument();
    expect(screen.getByTestId('carousel-post-post-2')).toBeInTheDocument();
  });

  it('passes answers and disabled state to child posts', () => {
    render(
      <Carousel>
        <ContentCarouselItems
          contentList={contentList}
          getAnswer={(id) => (id === 'post-1' ? 'like' : null)}
          isPostDisabled={(id) => id === 'post-2'}
          onAnswer={jest.fn()}
        />
      </Carousel>,
    );

    expect(screen.getByTestId('carousel-answer-post-1')).toHaveTextContent('like');
    expect(screen.getByTestId('carousel-post-post-2')).toHaveAttribute('data-disabled', 'true');
  });
});

export type User = {
  id: string;
  name: string;
  avatar: React.ReactNode;
  handle: string;
  isUser: boolean;
}

export type Post = {
  title: string;
  description: string;
  image: string;
  link: string;
}

export type ContentId = string;

export enum ContentType {
  LIKE_DISLIKE = 'like_dislike',
  SHARE = 'share',
}

export interface ContentBase {
  id: ContentId;
  type: ContentType;
}

export interface LikeDislikeContent extends ContentBase {
  type: ContentType.LIKE_DISLIKE;
  post: Post;
}

export interface ShareContent extends ContentBase {
  type: ContentType.SHARE;
}

export type Content = LikeDislikeContent | ShareContent;


export const content: Record<ContentId, Content> = {
  '1': {
    id: '1',
    type: ContentType.LIKE_DISLIKE,
    post: {
      title: 'Post 1',
      description: 'Newfeeds description',
      image: 'Newfeeds image',
      link: 'Newfeeds link',
    },
  },
  '2': {
    id: '2',
    type: ContentType.SHARE,
  },
}

export const contentList = Object.values(content);
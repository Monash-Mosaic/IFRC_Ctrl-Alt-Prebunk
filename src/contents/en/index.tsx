import EchoAvatar from "@/app/[locale]/chat/onboarding/_icons/echo-avatar";
import PaulaAvatar from "@/app/[locale]/chat/onboarding/_icons/paula-avatar";

// MCQ content imports
import Mcq1Question from "./post/mcq-1-question.md";
import Mcq1WhyCorrectTitle from "./post/mcq-1-why-correct-title.md";
import Mcq1WhyCorrectContent from "./post/mcq-1-why-correct-content.md";
import Mcq1WhyIncorrectTitle from "./post/mcq-1-why-incorrect-title.md";
import Mcq1WhyIncorrectContent from "./post/mcq-1-why-incorrect-content.md";

// Post content imports
import Content1Post from "./post/content-1-post.md";
import Content2Post from "./post/content-2-post.md";
import Content3Post from "./post/content-3-post.md";
import Content4Post from "./post/content-4-post.md";
import Content5Post from "./post/content-5-post.md";

// Explanation imports for content 1
import Content1WhyCorrectTitle from "./post/content-1-why-correct-title.md";
import Content1WhyCorrectContent from "./post/content-1-why-correct-content.md";
import Content1WhyIncorrectTitle from "./post/content-1-why-incorrect-title.md";
import Content1WhyIncorrectContent from "./post/content-1-why-incorrect-content.md";

// Explanation imports for content 2
import Content2WhyCorrectTitle from "./post/content-2-why-correct-title.md";
import Content2WhyCorrectContent from "./post/content-2-why-correct-content.md";
import Content2WhyIncorrectTitle from "./post/content-2-why-incorrect-title.md";
import Content2WhyIncorrectContent from "./post/content-2-why-incorrect-content.md";

// Explanation imports for content 3
import Content3WhyCorrectTitle from "./post/content-3-why-correct-title.md";
import Content3WhyCorrectContent from "./post/content-3-why-correct-content.md";
import Content3WhyIncorrectTitle from "./post/content-3-why-incorrect-title.md";
import Content3WhyIncorrectContent from "./post/content-3-why-incorrect-content.md";

// Explanation imports for content 4
import Content4WhyCorrectTitle from "./post/content-4-why-correct-title.md";
import Content4WhyCorrectContent from "./post/content-4-why-correct-content.md";
import Content4WhyIncorrectTitle from "./post/content-4-why-incorrect-title.md";
import Content4WhyIncorrectContent from "./post/content-4-why-incorrect-content.md";

// Explanation imports for content 5
import Content5WhyCorrectTitle from "./post/content-5-why-correct-title.md";
import Content5WhyCorrectContent from "./post/content-5-why-correct-content.md";
import Content5WhyIncorrectTitle from "./post/content-5-why-incorrect-title.md";
import Content5WhyIncorrectContent from "./post/content-5-why-incorrect-content.md";

export type User = {
  id: string;
  name: string;
  avatar: React.ReactNode;
  handle: string;
  isUser: boolean;
}

export type Post = {
  id: string;
  user: User;
  content: React.ReactNode;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

export type ContentId = string;

export enum ContentType {
  LIKE_DISLIKE = 'like_dislike',
  SHARE = 'share',
  MCQ = 'mcq',
}

export interface ContentBase {
  id: ContentId;
  type: ContentType;
}

export interface LikeDislikeContent extends ContentBase {
  type: ContentType.LIKE_DISLIKE;
  post: Post;
  correctAnswer: 'like' | 'dislike';
  whyCorrectAnswer: {
    title: React.ReactNode;
    content: React.ReactNode;
  };
  whyIncorrectAnswer: {
    title: React.ReactNode;
    content: React.ReactNode;
  };
}

export interface MCQOption {
  id: string;
  label: string;
}

export interface MCQContent extends ContentBase {
  type: ContentType.MCQ;
  post: Post;
  options: MCQOption[];
  correctOptionId: string;
  whyCorrectAnswer: {
    title: React.ReactNode;
    content: React.ReactNode;
  };
  whyIncorrectAnswer: {
    title: React.ReactNode;
    content: React.ReactNode;
  };
}

export interface ShareContent extends ContentBase {
  type: ContentType.SHARE;
  correctAnswer: 'share' | 'skip';
  whyCorrectAnswer: {
    title: React.ReactNode;
    content: React.ReactNode;
  };
  whyIncorrectAnswer: {
    title: React.ReactNode;
    content: React.ReactNode;
  };
}

export type UserId = string;

export type Content = LikeDislikeContent | ShareContent | MCQContent;

export const users: Record<UserId, User> = {
  'paula': {
    id: 'paula',
    name: 'Paula',
    avatar: <PaulaAvatar />,
    handle: '@paula',
    isUser: false,
  },
  'echo': {
    id: 'echo',
    name: 'Echo',
    avatar: <EchoAvatar />,
    handle: '@echo',
    isUser: false,
  },
  'user': {
    id: 'user',
    name: 'You',
    avatar: null,
    handle: '@user',
    isUser: true,
  },
}


export const content: Record<ContentId, Content> = {
  '1': {
    id: '1',
    type: ContentType.LIKE_DISLIKE,
    post: {
      id: '1',
      user: users['echo'],
      content: <Content1Post />,
      mediaUrl: '/images/posts/post-1.jpg',
      mediaType: 'image',
    },
    correctAnswer: 'like',
    whyCorrectAnswer: {
      title: <Content1WhyCorrectTitle />,
      content: <Content1WhyCorrectContent />,
    },
    whyIncorrectAnswer: {
      title: <Content1WhyIncorrectTitle />,
      content: <Content1WhyIncorrectContent />,
    },
  },
  '2': {
    id: '2',
    type: ContentType.LIKE_DISLIKE,
    post: {
      id: '2',
      user: users['echo'],
      content: <Content2Post />,
      mediaUrl: '/images/posts/post-2.jpg',
      mediaType: 'image',
    },
    correctAnswer: 'dislike',
    whyCorrectAnswer: {
      title: <Content2WhyCorrectTitle />,
      content: <Content2WhyCorrectContent />,
    },
    whyIncorrectAnswer: {
      title: <Content2WhyIncorrectTitle />,
      content: <Content2WhyIncorrectContent />,
    },
  },
  '3': {
    id: '3',
    type: ContentType.LIKE_DISLIKE,
    post: {
      id: '3',
      user: users['echo'],
      content: <Content3Post />,
      mediaUrl: '/images/posts/post-3.jpg',
      mediaType: 'image',
    },
    correctAnswer: 'like',
    whyCorrectAnswer: {
      title: <Content3WhyCorrectTitle />,
      content: <Content3WhyCorrectContent />,
    },
    whyIncorrectAnswer: {
      title: <Content3WhyIncorrectTitle />,
      content: <Content3WhyIncorrectContent />,
    },
  },
  '4': {
    id: '4',
    type: ContentType.LIKE_DISLIKE,
    post: {
      id: '4',
      user: users['echo'],
      content: <Content4Post />,
      mediaUrl: '/images/posts/post-4.jpg',
      mediaType: 'image',
    },
    correctAnswer: 'dislike',
    whyCorrectAnswer: {
      title: <Content4WhyCorrectTitle />,
      content: <Content4WhyCorrectContent />,
    },
    whyIncorrectAnswer: {
      title: <Content4WhyIncorrectTitle />,
      content: <Content4WhyIncorrectContent />,
    },
  },
  '5': {
    id: '5',
    type: ContentType.LIKE_DISLIKE,
    post: {
      id: '5',
      user: users['echo'],
      content: <Content5Post />,
      mediaUrl: '/images/posts/post-5.jpg',
      mediaType: 'image',
    },
    correctAnswer: 'dislike',
    whyCorrectAnswer: {
      title: <Content5WhyCorrectTitle />,
      content: <Content5WhyCorrectContent />,
    },
    whyIncorrectAnswer: {
      title: <Content5WhyIncorrectTitle />,
      content: <Content5WhyIncorrectContent />,
    },
  },
  'mcq-1': {
    id: 'mcq-1',
    type: ContentType.MCQ,
    post: {
      id: 'mcq-1',
      user: users['echo'],
      content: <Mcq1Question />,
    },
    options: [
      { id: 'a', label: "That's huge if true! Yes, let's share it, so people know!" },
      { id: 'b', label: 'Wait! Something seems off!' },
      { id: 'c', label: 'Wait! Something seems off about this post' },
      { id: 'd', label: 'Wait! I should fact-check this before sharing' },
    ],
    correctOptionId: 'b',
    whyCorrectAnswer: {
      title: <Mcq1WhyCorrectTitle />,
      content: <Mcq1WhyCorrectContent />,
    },
    whyIncorrectAnswer: {
      title: <Mcq1WhyIncorrectTitle />,
      content: <Mcq1WhyIncorrectContent />,
    },
  },
}

export const contentList = Object.values(content);
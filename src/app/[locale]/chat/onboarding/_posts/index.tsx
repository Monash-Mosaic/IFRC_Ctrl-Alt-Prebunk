import EchoPostEn from './en/EchoPost.md';
import EchoPostAr from './ar/EchoPost.md';
import EchoPostEs from './es/EchoPost.md';
import EchoPostFr from './fr/EchoPost.md';
import EchoPostRu from './ru/EchoPost.md';
import EchoPostZh from './zh/EchoPost.md';
import type { Locale } from 'next-intl';

const POSTS: Record<Locale, { echoPost: React.ReactNode }> = {
  ar: {
    echoPost: <EchoPostAr />,
  },
  en: {
    echoPost: <EchoPostEn />,
  },
  es: {
    echoPost: <EchoPostEs />,
  },
  fr: {
    echoPost: <EchoPostFr />,
  },
  ru: {
    echoPost: <EchoPostRu />,
  },
  zh: {
    echoPost: <EchoPostZh />,
  },
};

export default POSTS;

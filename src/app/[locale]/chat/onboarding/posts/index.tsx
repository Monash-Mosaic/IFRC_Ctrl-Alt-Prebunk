import EchoPostEn from "./en/EchoPost.mdx";
import EchoPostAr from "./ar/EchoPost.mdx";
import EchoPostEs from "./es/EchoPost.mdx";
import EchoPostFr from "./fr/EchoPost.mdx";
import EchoPostRu from "./ru/EchoPost.mdx";
import EchoPostZh from "./zh/EchoPost.mdx";
import type { Locale } from "next-intl";

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
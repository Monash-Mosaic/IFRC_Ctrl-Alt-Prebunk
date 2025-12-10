import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["en", "es", "fr", "ru", "zh", "ar"],

  // Used when no locale matches
  defaultLocale: "en",

  // Locale prefix strategy
  localePrefix: "always",

  pathnames: {
    "/": {
      "en": "/",
      "es": "/",
      "fr": "/",
      "ru": "/",
      "zh": "/",
      "ar": "/",
    },
    "/chat": {
      "en": "/chat",
      "es": "/chat",
      "fr": "/discussion",
      "ru": "/чат",
      "zh": "/聊天",
      "ar": "/دردشة",
    },
    "/chat/onboarding": {
      "en": "/chat/onboarding",
      "es": "/chat/introduccion",
      "fr": "/discussion/accueil",
      "ru": "/чат/введение",
      "zh": "/聊天/上手",
      "ar": "/دردشة/تعريف",
    },
    "/analytics": {
      "en": "/analytics",
      "es": "/analitica",
      "fr": "/statistiques",
      "ru": "/аналитика",
      "zh": "/分析",
      "ar": "/تحليلات",
    },
    "/share": {
      "en": "/share",
      "es": "/compartir",
      "fr": "/partager",
      "ru": "/поделиться",
      "zh": "/分享",
      "ar": "/مشاركة",
    },
    "/profile": {
      "en": "/profile",
      "es": "/perfil",
      "fr": "/profil",
      "ru": "/профиль",
      "zh": "/个人资料",
      "ar": "/ملف-شخصي",
    },
  },
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);


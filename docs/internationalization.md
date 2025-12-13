# Internationalization (i18n)

This project uses [next-intl](https://next-intl-docs.vercel.app/) for internationalization with support for multiple languages:

- **English (en)** - Default locale
- **Spanish (es)**
- **French (fr)**
- **Russian (ru)**
- **Chinese (zh)**
- **Arabic (ar)** - RTL (Right-to-Left) support

## RTL Support

Arabic (ar) is configured with full RTL support. The layout automatically adjusts:

- Text direction (`dir="rtl"`)
- Sidebar positioning (right side on desktop)
- Navigation alignment
- Spacing and margins

## Adding Translations

1. Edit the message files in `/src/messages/{locale}.json`
2. Use translations in components with `useTranslations()` hook (client components) or `getTranslations()` from `next-intl/server` (server components)
3. Use the `<Link>` component from `@/i18n/routing` for locale-aware navigation

## URL Structure

- English: `/en/...`
- Spanish: `/es/...`
- French: `/fr/...`
- Russian: `/ru/...`
- Chinese: `/zh/...`
- Arabic: `/ar/...`

The root URL (`/`) automatically redirects to the default locale (`/en`).

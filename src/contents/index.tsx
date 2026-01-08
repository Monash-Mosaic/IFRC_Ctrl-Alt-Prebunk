import type { Locale } from '@/i18n/routing';
import { routing } from '@/i18n/routing';

// Type for the content module structure
// Using the en module as the reference type, but allowing for partial modules
export type ContentModule = typeof import('./en');

// Cache for loaded content modules
const contentCache = new Map<Locale, ContentModule>();

/**
 * Dynamically loads content for a specific locale
 * This function lazy loads the content module only when needed
 * 
 * @param locale - The locale to load content for
 * @returns Promise resolving to the content module
 */
export async function getContent(locale: Locale): Promise<ContentModule> {
  // Check cache first
  if (contentCache.has(locale)) {
    return contentCache.get(locale)!;
  }

  // Validate locale
  if (!routing.locales.includes(locale)) {
    console.warn(`Invalid locale: ${locale}, falling back to default locale`);
    locale = routing.defaultLocale as Locale;
  }

  // Dynamically import the content module
  let contentModule: ContentModule;
  try {
    // Use dynamic import - cast through unknown to allow for modules 
    // that may not have all exports yet (other locales are still being populated)
    switch (locale) {
      case 'en':
        contentModule = await import('./en');
        break;
      case 'es':
        contentModule = (await import('./es')) as unknown as ContentModule;
        break;
      case 'fr':
        contentModule = (await import('./fr')) as unknown as ContentModule;
        break;
      case 'ru':
        contentModule = (await import('./ru')) as unknown as ContentModule;
        break;
      case 'zh':
        contentModule = (await import('./zh')) as unknown as ContentModule;
        break;
      case 'ar':
        contentModule = (await import('./ar')) as unknown as ContentModule;
        break;
      default:
        contentModule = await import('./en');
    }
  } catch (error) {
    console.error(`Failed to load content for locale ${locale}:`, error);
    // Fallback to default locale
    contentModule = await import('./en');
  }

  // Cache the loaded module
  contentCache.set(locale, contentModule);
  return contentModule;
}

/**
 * Preloads content for a specific locale
 * Useful for prefetching content before it's needed
 * 
 * @param locale - The locale to preload content for
 */
export async function preloadContent(locale: Locale): Promise<void> {
  await getContent(locale);
}

/**
 * Gets content synchronously if already cached
 * Returns undefined if content is not yet loaded
 * 
 * @param locale - The locale to get content for
 * @returns The content module if cached, undefined otherwise
 */
export function getCachedContent(locale: Locale): ContentModule | undefined {
  return contentCache.get(locale);
}

// Export types from the default locale for TypeScript support
export type {
  User,
  Post,
  ContentId,
  ContentType,
  ContentBase,
  LikeDislikeContent,
  ShareContent,
  Content,
} from './en';

// For backward compatibility, you can still import default
// but it's recommended to use getContent() function instead
export default getContent;
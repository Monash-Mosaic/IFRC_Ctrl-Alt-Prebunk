import { getRequestConfig } from 'next-intl/server';
import englishMessages from '../messages/en.json';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }

  const messages = (await import(`../messages/${locale}.json`)).default;

  return {
    locale,
    messages: {
      ...messages,
      nav: { contactUs: englishMessages.nav.contactUs, ...messages.nav },
      contact: { ...englishMessages.contact, ...messages.contact },
    },
  };
});

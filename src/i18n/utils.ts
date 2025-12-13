import { routing } from './routing';

export const RTL_LOCALES: readonly string[] = ['ar'] as const;

export function isRTLLocale(locale: string): boolean {
  return RTL_LOCALES.includes(locale);
}

export function getDirection(locale: string): 'ltr' | 'rtl' {
  return isRTLLocale(locale) ? 'rtl' : 'ltr';
}

export function isValidLocale(locale: string): boolean {
  return (routing.locales as readonly string[]).includes(locale);
}

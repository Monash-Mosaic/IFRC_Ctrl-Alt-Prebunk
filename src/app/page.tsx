import { routing } from '@/i18n/routing';
import { redirect } from 'next/navigation';

// This page only renders when the user visits the root URL
export default function RootPage() {
  // Redirect to the default locale
  redirect(`/${routing.defaultLocale}`);
}

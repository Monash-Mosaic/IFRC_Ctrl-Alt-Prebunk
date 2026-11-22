'use client';

import { type Ref, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, type routing, usePathname } from '@/i18n/routing';
import { Home, MessageSquare, PieChart, Upload, User, X } from 'lucide-react';
import Toast from '@/components/toast';
import { useAlexChat } from '@/lib/use-alex-chat';
import { useGameCompleted, useQuizInProgress } from '@/lib/use-game-store';

/** Destinations that cannot be opened while a quiz question is in progress. */
const QUIZ_LOCKED_ROUTES: readonly string[] = ['/profile'];

function AlexNotice({
  variant,
  message,
  closeLabel,
  onClose,
  noticeRef,
}: {
  variant: 'side' | 'above';
  message: string;
  closeLabel: string;
  onClose: () => void;
  noticeRef?: Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={noticeRef}
      className={
        variant === 'side'
          ? 'absolute top-1/2 z-50 w-max max-w-[14rem] -translate-y-1/2 ltr:left-full ltr:ml-3 rtl:right-full rtl:mr-3'
          : 'absolute bottom-full left-1/2 z-50 mb-3 w-max max-w-[14rem] -translate-x-1/2'
      }
    >
      <div className="relative">
        <Link
          href="/chat/alex"
          className="relative flex items-start rounded-xl border-2 border-[#011E41] bg-white py-2 pl-3 pr-8 text-sm font-medium leading-snug text-[#011E41] shadow-lg rtl:pr-3 rtl:pl-8"
        >
          <span
            aria-hidden
            className={
              variant === 'side'
                ? 'absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 border-[#011E41] bg-white ltr:-left-[7px] ltr:border-b-2 ltr:border-l-2 rtl:-right-[7px] rtl:border-r-2 rtl:border-t-2'
                : 'absolute -bottom-[7px] left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-[#011E41] bg-white'
            }
          />
          {message}
        </Link>
        <button
          type="button"
          aria-label={closeLabel}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onClose();
          }}
          className="absolute top-2 z-10 rounded-full p-0.5 text-[#6B7280] hover:text-[#011E41] ltr:right-2 rtl:left-2"
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

interface NavItem {
  href: keyof typeof routing.pathnames;
  labelKey: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
}

export default function Navigation() {
  const t = useTranslations('nav');
  const alexT = useTranslations('chat.alex');
  const pathname = usePathname();
  const [alexChat] = useAlexChat();
  const gameCompleted = useGameCompleted();
  const mobileNavRef = useRef<HTMLElement>(null);
  const mobileNoticeRef = useRef<HTMLDivElement>(null);
  const [noticeDismissed, setNoticeDismissed] = useState(false);
  const [wasNotified, setWasNotified] = useState(alexChat.notified);
  const quizInProgress = useQuizInProgress();
  const [lockedMessage, setLockedMessage] = useState<string | null>(null);
  const closeLockedMessage = useCallback(() => setLockedMessage(null), []);

  // While a question is under way these destinations stay closed, so the player
  // remains on their current question (the link is kept focusable and explains why).
  const isLocked = (href: NavItem['href']) => quizInProgress && QUIZ_LOCKED_ROUTES.includes(href);

  const lockedLinkProps = (href: NavItem['href']) =>
    isLocked(href)
      ? {
          'aria-disabled': true,
          onClick: (event: React.MouseEvent) => {
            event.preventDefault();
            setLockedMessage(t('lockedDuringQuiz'));
          },
        }
      : {};

  if (alexChat.notified !== wasNotified) {
    setWasNotified(alexChat.notified);
    if (!alexChat.notified) setNoticeDismissed(false);
  }

  const showAlexNotice =
    !gameCompleted &&
    alexChat.notified &&
    !alexChat.reply &&
    !noticeDismissed &&
    !pathname.startsWith('/chat');

  useLayoutEffect(() => {
    const nav = mobileNavRef.current;
    if (!nav) return;
    const notice = showAlexNotice ? mobileNoticeRef.current : null;
    const root = document.documentElement;

    // Give the feed enough scroll space to clear the fixed nav and notice on mobile.
    const updateFeedInset = () => {
      const bounds = nav.getBoundingClientRect();
      const top = Math.min(bounds.top, notice?.getBoundingClientRect().top ?? bounds.top);
      root.style.setProperty('--mobile-feed-bottom', `${Math.ceil(bounds.bottom - top)}px`);
    };

    updateFeedInset();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateFeedInset);
    observer?.observe(nav);
    if (notice) observer?.observe(notice);
    window.addEventListener('resize', updateFeedInset);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateFeedInset);
      root.style.removeProperty('--mobile-feed-bottom');
    };
  }, [showAlexNotice]);

  const navItems: NavItem[] = [
    {
      href: '/',
      labelKey: 'home',
      icon: <Home size={24} strokeWidth={2} />,
      activeIcon: <Home size={24} stroke="currentColor" />,
    },
    {
      href: '/chat',
      labelKey: 'chat',
      icon: <MessageSquare size={24} strokeWidth={2} />,
      activeIcon: <MessageSquare size={24} stroke="currentColor" />,
    },
    {
      href: '/analytics',
      labelKey: 'analytics',
      icon: <PieChart size={24} strokeWidth={2} />,
      activeIcon: <PieChart size={24} stroke="currentColor" />,
    },
    {
      href: '/share',
      labelKey: 'share',
      icon: <Upload size={24} strokeWidth={2} />,
      activeIcon: <Upload size={24} stroke="currentColor" />,
    },
    {
      href: '/profile',
      labelKey: 'profile',
      icon: <User size={24} strokeWidth={2} />,
      activeIcon: <User size={24} stroke="currentColor" />,
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed top-24 z-40 hidden h-[calc(100vh-6rem)] w-20 flex-col border-[#E8E9ED] bg-white md:flex ltr:left-0 ltr:border-r rtl:right-0 rtl:border-l rtl:border-r-0">
        <nav className="flex flex-1 flex-col justify-center items-center gap-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <div key={item.href} className="relative">
                <Link
                  href={item.href}
                  {...lockedLinkProps(item.href)}
                  className={`group flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 transition-colors ${
                    isLocked(item.href)
                      ? 'cursor-not-allowed text-(--color-ifrc-blue) opacity-40'
                      : isActive
                        ? 'text-(--color-ifrc-red)'
                        : 'text-(--color-ifrc-blue) hover:text-(--color-ifrc-red)'
                  }`}
                >
                  <span className="transition-transform group-hover:scale-110">
                    {isActive ? item.activeIcon : item.icon}
                  </span>
                  <span className="text-[11px] font-medium">{t(item.labelKey)}</span>
                </Link>
                {showAlexNotice && item.href === '/chat' && (
                  <AlexNotice
                    variant="side"
                    message={alexT('notification')}
                    closeLabel="Close notification"
                    onClose={() => setNoticeDismissed(true)}
                  />
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav
        ref={mobileNavRef}
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E8E9ED] bg-white md:hidden"
      >
        <div className="flex h-16 items-center justify-around px-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <div key={item.href} className="relative">
                <Link
                  href={item.href}
                  {...lockedLinkProps(item.href)}
                  className={`group flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 transition-colors ${
                    isLocked(item.href)
                      ? 'cursor-not-allowed text-(--color-ifrc-blue) opacity-40'
                      : isActive
                        ? 'text-(--color-ifrc-red)'
                        : 'text-(--color-ifrc-blue) hover:text-(--color-ifrc-red)'
                  }`}
                >
                  <span className="transition-transform group-hover:scale-110">
                    {isActive ? item.activeIcon : item.icon}
                  </span>
                  <span className="text-[11px] font-medium">{t(item.labelKey)}</span>
                </Link>
                {showAlexNotice && item.href === '/chat' && (
                  <AlexNotice
                    variant="above"
                    noticeRef={mobileNoticeRef}
                    message={alexT('notification')}
                    closeLabel="Close notification"
                    onClose={() => setNoticeDismissed(true)}
                  />
                )}
              </div>
            );
          })}
        </div>
        {/* Safe area for devices with home indicator */}
        <div className="h-safe-area bg-white" />
      </nav>

      <Toast
        message={lockedMessage ?? ''}
        isVisible={lockedMessage !== null}
        onClose={closeLockedMessage}
        // Sit above the fixed mobile bottom nav (4rem).
        className="z-[110] max-md:bottom-20"
      />
    </>
  );
}

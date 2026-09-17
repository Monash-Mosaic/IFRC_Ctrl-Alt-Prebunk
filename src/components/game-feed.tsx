'use client';

import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ChevronDown, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface GameFeedHandle {
  /** Snap the feed so the post at `index` fills the screen. */
  scrollToPost: (index: number) => void;
}

export interface GameFeedLabels {
  /** Floating cue shown while the current post is taller than the screen and unscrolled. */
  scrollHint: string;
  /** Row rendered under the current post while progression is locked. */
  lockedHint: string;
}

export interface GameFeedProps {
  /** Ids of the posts that are currently unlocked, in feed order. */
  postIds: string[];
  renderPost: (postId: string, index: number) => React.ReactNode;
  /** True while the last post in `postIds` still needs an answer. */
  isLocked: boolean;
  labels: GameFeedLabels;
  onActiveIndexChange?: (index: number) => void;
  /** Called (throttled) when the user tries to scroll past the end while locked. */
  onBlockedScrollAttempt?: () => void;
  className?: string;
  ref?: React.Ref<GameFeedHandle>;
}

const BLOCKED_ATTEMPT_THROTTLE_MS = 3000;
const END_THRESHOLD_PX = 2;
const SCROLL_ANIMATION_MS = 350;

function isAtEnd(el: HTMLElement) {
  return el.scrollTop + el.clientHeight >= el.scrollHeight - END_THRESHOLD_PX;
}

function overflows(el: HTMLElement) {
  return el.scrollHeight > el.clientHeight + END_THRESHOLD_PX;
}

/**
 * One-post-per-screen feed (TikTok / Instagram style) built on native CSS
 * scroll-snap. The outer container snaps between full-height slots; a post that
 * is taller than the screen scrolls inside its own slot, so the next post never
 * shares the screen with it. Nothing intercepts touch or wheel events, so this
 * behaves the same in Safari, Chrome and in-app browsers. Progression is
 * controlled purely by which posts are rendered: the caller passes only the
 * answered posts plus the current one, so there is nothing further to reach.
 */
export default function GameFeed({
  postIds,
  renderPost,
  isLocked,
  labels,
  onActiveIndexChange,
  onBlockedScrollAttempt,
  className,
  ref,
}: GameFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const scrolledSlotsRef = useRef<Set<number>>(new Set());
  const lastBlockedAttemptRef = useRef(0);
  const touchStartYRef = useRef<number | null>(null);
  const activeIndexRef = useRef(0);

  const getSlot = useCallback((index: number) => {
    return containerRef.current?.querySelector<HTMLElement>(`[data-post-index="${index}"]`) ?? null;
  }, []);

  const getSlotScroller = useCallback(
    (index: number) => getSlot(index)?.querySelector<HTMLElement>('[data-post-scroller]') ?? null,
    [getSlot]
  );

  const currentIndex = useCallback(() => {
    const el = containerRef.current;
    if (!el || el.clientHeight === 0) return 0;
    const index = Math.round(el.scrollTop / el.clientHeight);
    return Math.max(0, Math.min(index, postIds.length - 1));
  }, [postIds.length]);

  const updateScrollHint = useCallback(() => {
    const index = currentIndex();
    const scroller = getSlotScroller(index);
    setShowScrollHint(
      !!scroller &&
        overflows(scroller) &&
        !scrolledSlotsRef.current.has(index) &&
        !isAtEnd(scroller)
    );
  }, [currentIndex, getSlotScroller]);

  const reportActiveIndex = useCallback(() => {
    const index = currentIndex();
    if (index !== activeIndexRef.current) {
      activeIndexRef.current = index;
      onActiveIndexChange?.(index);
    }
  }, [currentIndex, onActiveIndexChange]);

  // Tears down the in-flight scrollToPost animation (frame loop and safety timer).
  const cancelAnimationRef = useRef<(() => void) | null>(null);

  // Never leave a timer armed after unmount: it would report an index to a gone parent.
  useEffect(() => () => cancelAnimationRef.current?.(), []);

  useImperativeHandle(
    ref,
    () => ({
      scrollToPost: (index: number) => {
        const el = containerRef.current;
        if (!el) return;
        // Supersede any jump in flight. Its safety timer must go too, or it would
        // fire later and snap the feed back to the stale target.
        cancelAnimationRef.current?.();
        cancelAnimationRef.current = null;

        const target = Math.max(0, Math.min(index, postIds.length - 1)) * el.clientHeight;
        const reduceMotion =
          typeof window.matchMedia === 'function' &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion || el.clientHeight === 0) {
          el.scrollTop = target;
          reportActiveIndex();
          updateScrollHint();
          return;
        }

        // Browsers cancel programmatic smooth scrolls inside a snap container, so
        // animate scrollTop ourselves with the snap lifted, then restore it. The
        // target is itself a snap position, so restoring never causes a jump.
        const start = el.scrollTop;
        const distance = target - start;
        const startTime = performance.now();
        let finished = false;
        let rafId = 0;
        let safetyTimer = 0;
        const cancel = () => {
          finished = true;
          cancelAnimationFrame(rafId);
          window.clearTimeout(safetyTimer);
        };
        const finish = () => {
          cancel();
          cancelAnimationRef.current = null;
          el.scrollTop = target;
          el.style.scrollSnapType = '';
          // Do not depend on the follow-up scroll event (it never fires in a hidden tab).
          reportActiveIndex();
          updateScrollHint();
        };
        const step = (now: number) => {
          if (finished) return;
          const progress = Math.min(1, (now - startTime) / SCROLL_ANIMATION_MS);
          el.scrollTop = start + distance * (1 - Math.pow(1 - progress, 3));
          if (progress < 1) {
            rafId = requestAnimationFrame(step);
          } else {
            finish();
          }
        };

        el.style.scrollSnapType = 'none';
        // Register the handle before scheduling: a rAF callback may run synchronously.
        cancelAnimationRef.current = cancel;
        // Frames stall in hidden tabs; never leave the feed stuck mid-way with snap off.
        safetyTimer = window.setTimeout(() => {
          if (!finished) finish();
        }, SCROLL_ANIMATION_MS * 2);
        rafId = requestAnimationFrame(step);
      },
    }),
    [postIds.length, reportActiveIndex, updateScrollHint]
  );

  // Re-evaluate the hint whenever the unlocked set or the viewport changes.
  useEffect(() => {
    updateScrollHint();
    reportActiveIndex();
    const el = containerRef.current;
    window.addEventListener('resize', updateScrollHint);
    let observer: ResizeObserver | undefined;
    if (el && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(updateScrollHint);
      observer.observe(el);
    }
    return () => {
      window.removeEventListener('resize', updateScrollHint);
      observer?.disconnect();
    };
  }, [postIds.length, updateScrollHint, reportActiveIndex]);

  // Scroll events do not bubble, so capture them from both the feed and the slot scrollers.
  const handleScrollCapture = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.hasAttribute('data-post-scroller') && target.scrollTop > 0) {
      scrolledSlotsRef.current.add(currentIndex());
    }
    updateScrollHint();
    reportActiveIndex();
  };

  const attemptPastEnd = () => {
    const el = containerRef.current;
    if (!el || !isLocked || !onBlockedScrollAttempt || !isAtEnd(el)) return;
    const scroller = getSlotScroller(postIds.length - 1);
    if (scroller && !isAtEnd(scroller)) return;
    const now = Date.now();
    if (now - lastBlockedAttemptRef.current < BLOCKED_ATTEMPT_THROTTLE_MS) return;
    lastBlockedAttemptRef.current = now;
    onBlockedScrollAttempt();
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (event.deltaY > 0) attemptPastEnd();
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartYRef.current = event.touches[0]?.clientY ?? null;
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    const startY = touchStartYRef.current;
    const currentY = event.touches[0]?.clientY;
    if (startY == null || currentY == null) return;
    // Finger moving up means the user is trying to scroll further down.
    if (startY - currentY > 24) attemptPastEnd();
  };

  return (
    <div className={cn('relative min-h-0 w-full flex-1', className)}>
      <div
        ref={containerRef}
        role="feed"
        aria-busy={false}
        onScrollCapture={handleScrollCapture}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        className={cn(
          'scrollbar-none h-full w-full overflow-y-auto overscroll-y-contain touch-pan-y',
          'snap-y snap-mandatory [-webkit-overflow-scrolling:touch]'
        )}
      >
        {postIds.map((postId, index) => (
          <div
            key={postId}
            data-post-index={index}
            data-post-id={postId}
            className="h-full w-full shrink-0 snap-start snap-always"
          >
            {/* A post taller than the screen scrolls inside its own slot. */}
            <div
              data-post-scroller=""
              className="scrollbar-none flex h-full w-full flex-col overflow-y-auto overscroll-y-contain px-1 py-1"
            >
              {renderPost(postId, index)}

              {isLocked && index === postIds.length - 1 && (
                <p
                  className="flex shrink-0 items-center justify-center gap-2 py-3 text-center text-xs font-medium text-[#6B7280]"
                  data-testid="feed-locked-hint"
                >
                  <Lock size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{labels.lockedHint}</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {showScrollHint && (
        <div
          className={cn(
            'pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2',
            'flex items-center gap-1 rounded-full bg-[#011E41]/90 px-3 py-1.5 text-xs font-medium text-white shadow-md',
            'animate-in fade-in duration-300'
          )}
          aria-hidden="true"
        >
          <span>{labels.scrollHint}</span>
          <ChevronDown size={14} strokeWidth={2.5} className="animate-bounce" />
        </div>
      )}
    </div>
  );
}

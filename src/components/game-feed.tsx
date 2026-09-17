'use client';

import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ChevronDown, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface GameFeedHandle {
  /** Slide the feed so the post at `index` fills the screen. */
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
  /** Post shown on first render, e.g. a returning player's current question. */
  initialIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  /** Called (throttled) when the user tries to move past the last post while locked. */
  onBlockedScrollAttempt?: () => void;
  className?: string;
  ref?: React.Ref<GameFeedHandle>;
}

const BLOCKED_ATTEMPT_THROTTLE_MS = 3000;
const EDGE_THRESHOLD_PX = 2;
/** A deliberate drag, or a shorter but fast flick, moves to the next/previous post. */
const SWIPE_DISTANCE_PX = 60;
const FLICK_DISTANCE_PX = 20;
const FLICK_VELOCITY_PX_PER_MS = 0.4;
/** Wheel travel needed at a post's edge before moving on (one mouse notch is ~100px). */
const WHEEL_DISTANCE_PX = 50;
/** Wheel events closer together than this belong to one gesture (incl. trackpad inertia). */
const WHEEL_GESTURE_GAP_MS = 150;
/** After a wheel move, ignore the rest of that gesture, but never for longer than the max. */
const WHEEL_MIN_LOCK_MS = 400;
const WHEEL_MAX_LOCK_MS = 1500;

type Direction = 1 | -1;

function isAtTop(el: HTMLElement) {
  return el.scrollTop <= EDGE_THRESHOLD_PX;
}

function isAtEnd(el: HTMLElement) {
  return el.scrollTop + el.clientHeight >= el.scrollHeight - EDGE_THRESHOLD_PX;
}

function overflows(el: HTMLElement) {
  return el.scrollHeight > el.clientHeight + EDGE_THRESHOLD_PX;
}

/**
 * One-post-per-screen feed (TikTok / Instagram style).
 *
 * Only the post card scrolls natively. The feed viewport itself never scrolls:
 * posts slide in with a CSS transform when the user swipes (or wheels) past the
 * top or bottom edge of the current card. Keeping a single native scroll area
 * avoids iOS Safari latching a gesture onto one of two nested scrollers, which
 * used to leave the feed unresponsive for a while.
 *
 * Progression is controlled purely by which posts are rendered: the caller passes
 * only the answered posts plus the current one, so there is nothing further to reach.
 */
export default function GameFeed({
  postIds,
  renderPost,
  isLocked,
  labels,
  initialIndex = 0,
  onActiveIndexChange,
  onBlockedScrollAttempt,
  className,
  ref,
}: GameFeedProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [requestedIndex, setRequestedIndex] = useState(() => Math.max(0, initialIndex));
  const [showScrollHint, setShowScrollHint] = useState(false);
  const scrolledSlotsRef = useRef<Set<number>>(new Set());
  const lastBlockedAttemptRef = useRef(0);
  const touchStartRef = useRef<{
    x: number;
    y: number;
    time: number;
    atTop: boolean;
    atEnd: boolean;
  } | null>(null);
  const wheelRef = useRef({ distance: 0, lastEvent: 0, lastNavigation: 0, locked: false });

  const lastIndex = Math.max(0, postIds.length - 1);
  const activeIndex = Math.min(requestedIndex, lastIndex);

  const getScroller = useCallback(
    (index: number) =>
      viewportRef.current?.querySelector<HTMLElement>(
        `[data-post-index="${index}"] [data-post-scroller]`
      ) ?? null,
    []
  );

  const goTo = useCallback(
    (index: number) => {
      const target = Math.min(Math.max(0, index), lastIndex);
      // Every post opens at its top, whichever direction it is entered from.
      const scroller = getScroller(target);
      if (scroller) scroller.scrollTop = 0;
      setRequestedIndex(target);
    },
    [getScroller, lastIndex]
  );

  useImperativeHandle(ref, () => ({ scrollToPost: goTo }), [goTo]);

  const updateScrollHint = useCallback(() => {
    const scroller = getScroller(activeIndex);
    setShowScrollHint(
      !!scroller &&
        overflows(scroller) &&
        !scrolledSlotsRef.current.has(activeIndex) &&
        !isAtEnd(scroller)
    );
  }, [activeIndex, getScroller]);

  useEffect(() => {
    onActiveIndexChange?.(activeIndex);
  }, [activeIndex, onActiveIndexChange]);

  // Re-evaluate the hint whenever the current post, the unlocked set or the viewport changes.
  useEffect(() => {
    updateScrollHint();
    const el = viewportRef.current;
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
  }, [postIds.length, updateScrollHint]);

  const attemptBlocked = () => {
    if (!isLocked || !onBlockedScrollAttempt) return;
    const now = Date.now();
    if (now - lastBlockedAttemptRef.current < BLOCKED_ATTEMPT_THROTTLE_MS) return;
    lastBlockedAttemptRef.current = now;
    onBlockedScrollAttempt();
  };

  const navigate = (direction: Direction) => {
    if (direction === 1) {
      if (activeIndex < lastIndex) goTo(activeIndex + 1);
      else attemptBlocked();
    } else if (activeIndex > 0) {
      goTo(activeIndex - 1);
    }
  };

  // Scroll events do not bubble, so capture them from the post scrollers.
  const handleScrollCapture = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target === viewportRef.current) {
      // The viewport must never scroll (focus or find-in-page can nudge it); undo it.
      target.scrollTop = 0;
      return;
    }
    if (target.hasAttribute('data-post-scroller') && target.scrollTop > 0) {
      scrolledSlotsRef.current.add(activeIndex);
    }
    updateScrollHint();
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch || event.touches.length > 1) {
      touchStartRef.current = null;
      return;
    }
    const scroller = getScroller(activeIndex);
    // Edges are read when the finger lands, so one swipe never both scrolls the
    // card to its end and jumps to the next post.
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
      atTop: !scroller || isAtTop(scroller),
      atEnd: !scroller || isAtEnd(scroller),
    };
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    const touch = event.changedTouches[0];
    if (!start || !touch) return;

    // Positive when the finger moved up, i.e. the user wants the next post.
    const dy = start.y - touch.clientY;
    const distance = Math.abs(dy);
    if (distance <= Math.abs(start.x - touch.clientX)) return;

    const elapsed = Math.max(1, Date.now() - start.time);
    const isSwipe =
      distance >= SWIPE_DISTANCE_PX ||
      (distance >= FLICK_DISTANCE_PX && distance / elapsed >= FLICK_VELOCITY_PX_PER_MS);
    if (!isSwipe) return;

    if (dy > 0 && start.atEnd) navigate(1);
    else if (dy < 0 && start.atTop) navigate(-1);
  };

  const handleTouchCancel = () => {
    touchStartRef.current = null;
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (event.deltaY === 0 || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    const wheel = wheelRef.current;
    const now = Date.now();
    const gap = now - wheel.lastEvent;
    wheel.lastEvent = now;

    if (wheel.locked) {
      const sinceNavigation = now - wheel.lastNavigation;
      const sameGesture = gap < WHEEL_GESTURE_GAP_MS;
      if (
        sinceNavigation < WHEEL_MIN_LOCK_MS ||
        (sameGesture && sinceNavigation < WHEEL_MAX_LOCK_MS)
      ) {
        return;
      }
      wheel.locked = false;
    }

    const direction: Direction = event.deltaY > 0 ? 1 : -1;
    const scroller = getScroller(activeIndex);
    const canScrollInside =
      !!scroller && (direction === 1 ? !isAtEnd(scroller) : !isAtTop(scroller));
    if (canScrollInside) {
      // Let the card scroll natively.
      wheel.distance = 0;
      return;
    }

    if (gap >= WHEEL_GESTURE_GAP_MS || Math.sign(wheel.distance) !== direction) {
      wheel.distance = 0;
    }
    wheel.distance += event.deltaY;
    if (Math.abs(wheel.distance) < WHEEL_DISTANCE_PX) return;

    wheel.distance = 0;
    wheel.locked = true;
    wheel.lastNavigation = now;
    navigate(direction);
  };

  return (
    <div className={cn('relative min-h-0 w-full flex-1', className)}>
      <div
        ref={viewportRef}
        role="feed"
        aria-busy={false}
        data-active-index={activeIndex}
        onScrollCapture={handleScrollCapture}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        className="h-full w-full overflow-hidden overscroll-none"
      >
        <div
          data-feed-track=""
          className="h-full w-full transition-transform duration-[350ms] ease-out motion-reduce:transition-none"
          style={{ transform: `translate3d(0, ${-activeIndex * 100}%, 0)` }}
        >
          {postIds.map((postId, index) => {
            const isActive = index === activeIndex;
            return (
              <div
                key={postId}
                data-post-index={index}
                data-post-id={postId}
                aria-hidden={!isActive}
                // Off-screen posts must not take focus: focusing them would scroll the viewport.
                inert={!isActive}
                className="h-full w-full"
              >
                {/* The only native scroll area: a post taller than the screen scrolls here. */}
                <div
                  data-post-scroller=""
                  className="scrollbar-none flex h-full w-full touch-pan-y flex-col overflow-y-auto overscroll-contain px-1 py-1"
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
            );
          })}
        </div>
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

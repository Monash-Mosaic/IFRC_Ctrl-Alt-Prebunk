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
/** Movement below this is treated as a tap until the gesture's direction is known. */
const DRAG_SLOP_PX = 6;
/** Dragging past the first/last post only moves the feed this fraction of the finger travel. */
const EDGE_RESISTANCE = 0.3;
/** Wheel travel needed at a post's edge before moving on (one mouse notch is ~100px). */
const WHEEL_DISTANCE_PX = 50;
/** Wheel events closer together than this belong to one gesture (incl. trackpad inertia). */
const WHEEL_GESTURE_GAP_MS = 150;
/** After a wheel move, ignore the rest of that gesture, but never for longer than the max. */
const WHEEL_MIN_LOCK_MS = 400;
const WHEEL_MAX_LOCK_MS = 1500;

type Direction = 1 | -1;

/**
 * A touch gesture on the feed. It is `pending` until it has moved far enough to
 * tell its direction, then either `feed` (we move the posts with the finger) or
 * `native` (the card scrolls itself and we stay out of the way).
 */
interface Gesture {
  x: number;
  y: number;
  time: number;
  atTop: boolean;
  atEnd: boolean;
  mode: 'pending' | 'feed' | 'native';
  /** For `feed` gestures: 1 = towards the next post, -1 = towards the previous one. */
  direction: Direction;
}

const trackTransform = (index: number, offsetPx = 0) =>
  offsetPx === 0
    ? `translate3d(0, ${-index * 100}%, 0)`
    : `translate3d(0, calc(${-index * 100}% + ${offsetPx}px), 0)`;

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
 * when a swipe starts at the top or bottom edge of the current card, the posts
 * follow the finger and then slide to the neighbouring post (or spring back).
 * Those edge swipes cancel the browser's default, which also stops Safari's
 * pull-to-refresh from grabbing the page. The wheel moves one post per gesture. Keeping a single native scroll area
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
  const trackRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef<Gesture | null>(null);
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

  const attemptBlocked = useCallback(() => {
    if (!isLocked || !onBlockedScrollAttempt) return;
    const now = Date.now();
    if (now - lastBlockedAttemptRef.current < BLOCKED_ATTEMPT_THROTTLE_MS) return;
    lastBlockedAttemptRef.current = now;
    onBlockedScrollAttempt();
  }, [isLocked, onBlockedScrollAttempt]);

  /** The post a move in `direction` lands on, or null when there is none. */
  const neighbourOf = useCallback(
    (direction: Direction) => {
      const target = activeIndex + direction;
      return target >= 0 && target <= lastIndex && postIds.length > 0 ? target : null;
    },
    [activeIndex, lastIndex, postIds.length]
  );

  const navigate = (direction: Direction) => {
    const target = neighbourOf(direction);
    if (target !== null) goTo(target);
    else if (direction === 1) attemptBlocked();
  };

  // Keep Safari's pull-to-refresh and page rubber-banding out of the feed while it is on screen.
  useEffect(() => {
    const roots = [document.documentElement, document.body];
    const previous = roots.map((el) => el.style.overscrollBehaviorY);
    roots.forEach((el) => {
      el.style.overscrollBehaviorY = 'none';
    });
    return () => {
      roots.forEach((el, i) => {
        el.style.overscrollBehaviorY = previous[i];
      });
    };
  }, []);

  // Touch handling is attached natively: touchmove must be non-passive so a pull at a
  // card's edge can cancel Safari's own pull-to-refresh / bounce and drive the feed instead.
  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const dragTo = (offset: number) => {
      track.style.transition = 'none';
      track.style.transform = trackTransform(activeIndex, offset);
    };

    // Animate from wherever the finger left the track to `index`. Setting the final
    // transform here (rather than waiting for React) avoids a frame snapping back first.
    const settleOn = (index: number) => {
      track.style.transition = '';
      track.style.transform = trackTransform(index);
    };

    const cancel = () => {
      const gesture = gestureRef.current;
      gestureRef.current = null;
      if (gesture?.mode === 'feed') settleOn(activeIndex);
    };

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch || event.touches.length > 1) {
        cancel();
        return;
      }
      const scroller = getScroller(activeIndex);
      // Edges are read when the finger lands, so one swipe never both scrolls the
      // card to its end and moves to another post.
      gestureRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
        atTop: !scroller || isAtTop(scroller),
        atEnd: !scroller || isAtEnd(scroller),
        mode: 'pending',
        direction: 1,
      };
    };

    const onTouchMove = (event: TouchEvent) => {
      const gesture = gestureRef.current;
      if (!gesture || gesture.mode === 'native') return;
      const touch = event.touches[0];
      if (!touch || event.touches.length > 1) {
        cancel();
        return;
      }

      // Positive when the finger moves up, i.e. towards the next post.
      const dy = gesture.y - touch.clientY;
      const dx = gesture.x - touch.clientX;

      if (gesture.mode === 'pending') {
        const ours = (dy > 0 && gesture.atEnd) || (dy < 0 && gesture.atTop);
        if (Math.abs(dy) < DRAG_SLOP_PX && Math.abs(dx) < DRAG_SLOP_PX) {
          // Stop Safari committing to pull-to-refresh before the direction is known.
          if (ours && event.cancelable) event.preventDefault();
          return;
        }
        if (!ours || Math.abs(dx) >= Math.abs(dy)) {
          gesture.mode = 'native';
          return;
        }
        gesture.mode = 'feed';
        gesture.direction = dy > 0 ? 1 : -1;
      }

      if (event.cancelable) event.preventDefault();
      // Only follow the finger in the direction the gesture started in.
      const travel = gesture.direction === 1 ? Math.max(0, dy) : Math.min(0, dy);
      const hasNeighbour = neighbourOf(gesture.direction) !== null;
      const height = viewport.clientHeight || Number.POSITIVE_INFINITY;
      const offset = -Math.max(
        -height,
        Math.min(height, hasNeighbour ? travel : travel * EDGE_RESISTANCE)
      );
      dragTo(offset);
    };

    const onTouchEnd = (event: TouchEvent) => {
      const gesture = gestureRef.current;
      gestureRef.current = null;
      if (!gesture || gesture.mode === 'native') return;
      const touch = event.changedTouches[0];
      if (!touch) {
        if (gesture.mode === 'feed') settleOn(activeIndex);
        return;
      }

      const dy = gesture.y - touch.clientY;
      const distance = Math.abs(dy);
      const direction: Direction = dy > 0 ? 1 : -1;
      const elapsed = Math.max(1, Date.now() - gesture.time);
      const isSwipe =
        distance > Math.abs(gesture.x - touch.clientX) &&
        (distance >= SWIPE_DISTANCE_PX ||
          (distance >= FLICK_DISTANCE_PX && distance / elapsed >= FLICK_VELOCITY_PX_PER_MS));
      const allowed =
        gesture.mode === 'feed'
          ? direction === gesture.direction
          : direction === 1
            ? gesture.atEnd
            : gesture.atTop;
      const commit = isSwipe && allowed;
      const target = commit ? neighbourOf(direction) : null;

      if (gesture.mode === 'feed') settleOn(target ?? activeIndex);
      if (target !== null) goTo(target);
      else if (commit && direction === 1) attemptBlocked();
    };

    viewport.addEventListener('touchstart', onTouchStart, { passive: true });
    viewport.addEventListener('touchmove', onTouchMove, { passive: false });
    viewport.addEventListener('touchend', onTouchEnd);
    viewport.addEventListener('touchcancel', cancel);
    return () => {
      viewport.removeEventListener('touchstart', onTouchStart);
      viewport.removeEventListener('touchmove', onTouchMove);
      viewport.removeEventListener('touchend', onTouchEnd);
      viewport.removeEventListener('touchcancel', cancel);
    };
  }, [activeIndex, attemptBlocked, getScroller, goTo, neighbourOf]);

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
        className="h-full w-full overflow-hidden overscroll-none"
      >
        <div
          ref={trackRef}
          data-feed-track=""
          className="h-full w-full transition-transform duration-[350ms] ease-out will-change-transform motion-reduce:transition-none"
          style={{ transform: trackTransform(activeIndex) }}
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

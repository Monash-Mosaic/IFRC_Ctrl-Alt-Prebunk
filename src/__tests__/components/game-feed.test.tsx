/**
 * Tests for GameFeed: a one-post-per-screen feed where only the post card scrolls
 * natively and posts slide in when the user swipes or wheels past a card's edge.
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@/test-utils/test-utils';
import GameFeed, { type GameFeedHandle } from '@/components/game-feed';

const labels = {
  scrollHint: 'Scroll to see more',
  lockedHint: 'Answer this post to unlock the next one',
};

function renderFeed(props: Partial<React.ComponentProps<typeof GameFeed>> = {}) {
  const ref = React.createRef<GameFeedHandle>();
  const onActiveIndexChange = jest.fn();
  const onBlockedScrollAttempt = jest.fn();
  const utils = render(
    <GameFeed
      ref={ref}
      postIds={['a', 'b', 'c']}
      renderPost={(id) => <button data-testid={`post-${id}`}>Post {id}</button>}
      isLocked={true}
      labels={labels}
      onActiveIndexChange={onActiveIndexChange}
      onBlockedScrollAttempt={onBlockedScrollAttempt}
      {...props}
    />
  );
  const feed = screen.getByRole('feed', { hidden: true });
  return { ...utils, ref, feed, onActiveIndexChange, onBlockedScrollAttempt };
}

function setSize(el: Element, clientHeight: number, scrollHeight: number) {
  Object.defineProperty(el, 'clientHeight', { value: clientHeight, configurable: true });
  Object.defineProperty(el, 'scrollHeight', { value: scrollHeight, configurable: true });
}

const activeIndex = (feed: HTMLElement) => Number(feed.getAttribute('data-active-index'));
const scrollerOf = (feed: HTMLElement, index: number) =>
  feed.querySelector<HTMLElement>(`[data-post-index="${index}"] [data-post-scroller]`)!;

/** Finger moves from `fromY` to `toY` (upward swipe = next post). */
function swipe(feed: HTMLElement, fromY: number, toY: number, { dx = 0 } = {}) {
  fireEvent.touchStart(feed, { touches: [{ clientX: 100, clientY: fromY }] });
  fireEvent.touchEnd(feed, { changedTouches: [{ clientX: 100 + dx, clientY: toY }] });
}
const swipeUp = (feed: HTMLElement) => swipe(feed, 500, 300);
const swipeDown = (feed: HTMLElement) => swipe(feed, 300, 500);

describe('GameFeed', () => {
  let now = 1_000_000;

  beforeEach(() => {
    now = 1_000_000;
    jest.spyOn(Date, 'now').mockImplementation(() => now);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('layout', () => {
    it('keeps the viewport fixed and gives each post its own scroll area', () => {
      const { feed } = renderFeed();
      expect(feed).toHaveClass('overflow-hidden');
      expect(feed).not.toHaveClass('overflow-y-auto');
      const slots = feed.querySelectorAll('[data-post-index]');
      expect(slots).toHaveLength(3);
      slots.forEach((slot) => {
        expect(slot).toHaveClass('h-full');
        expect(slot.querySelector('[data-post-scroller]')).toHaveClass(
          'overflow-y-auto',
          'overscroll-contain',
          'scrollbar-none'
        );
      });
    });

    it('shows only the active post and keeps the others out of focus order', () => {
      const { feed } = renderFeed();
      const track = feed.querySelector<HTMLElement>('[data-feed-track]')!;
      expect(track.style.transform).toBe('translate3d(0, 0%, 0)');
      expect(feed.querySelector('[data-post-index="0"]')).not.toHaveAttribute('inert');
      expect(feed.querySelector('[data-post-index="1"]')).toHaveAttribute('inert');
      expect(feed.querySelector('[data-post-index="1"]')).toHaveAttribute('aria-hidden', 'true');
    });

    it('starts on the requested initial post', () => {
      const { feed, onActiveIndexChange } = renderFeed({ initialIndex: 2 });
      expect(activeIndex(feed)).toBe(2);
      expect(feed.querySelector<HTMLElement>('[data-feed-track]')!.style.transform).toBe(
        'translate3d(0, -200%, 0)'
      );
      expect(onActiveIndexChange).toHaveBeenLastCalledWith(2);
    });

    it('clamps an out-of-range initial post to the unlocked ones', () => {
      expect(activeIndex(renderFeed({ initialIndex: 9 }).feed)).toBe(2);
    });

    it('shows the locked hint under the last post only while locked', () => {
      const { rerender } = renderFeed({ isLocked: true });
      expect(screen.getByTestId('feed-locked-hint').closest('[data-post-index]')).toHaveAttribute(
        'data-post-index',
        '2'
      );
      rerender(
        <GameFeed
          postIds={['a', 'b', 'c']}
          renderPost={() => null}
          isLocked={false}
          labels={labels}
        />
      );
      expect(screen.queryByTestId('feed-locked-hint')).not.toBeInTheDocument();
    });

    it('renders safely with no posts', () => {
      const { ref, feed, onBlockedScrollAttempt } = renderFeed({ postIds: [], isLocked: false });
      expect(feed.querySelectorAll('[data-post-index]')).toHaveLength(0);
      act(() => ref.current?.scrollToPost(1));
      swipeUp(feed);
      fireEvent.wheel(feed, { deltaY: 100 });
      expect(activeIndex(feed)).toBe(0);
      expect(onBlockedScrollAttempt).not.toHaveBeenCalled();
    });

    it('works in browsers without ResizeObserver', () => {
      const original = global.ResizeObserver;
      // @ts-expect-error simulate an older browser
      delete global.ResizeObserver;
      try {
        const { unmount, feed } = renderFeed();
        expect(feed).toBeInTheDocument();
        unmount();
      } finally {
        global.ResizeObserver = original;
      }
    });

    it('undoes any scroll applied to the fixed viewport', () => {
      const { feed } = renderFeed();
      feed.scrollTop = 120;
      fireEvent.scroll(feed);
      expect(feed.scrollTop).toBe(0);
    });
  });

  describe('imperative handle', () => {
    it('moves to the requested post and reports it', () => {
      const { ref, feed, onActiveIndexChange } = renderFeed();
      act(() => ref.current?.scrollToPost(1));
      expect(activeIndex(feed)).toBe(1);
      expect(feed.querySelector<HTMLElement>('[data-feed-track]')!.style.transform).toBe(
        'translate3d(0, -100%, 0)'
      );
      expect(onActiveIndexChange).toHaveBeenLastCalledWith(1);
    });

    it('clamps the requested index to the available posts', () => {
      const { ref, feed } = renderFeed();
      act(() => ref.current?.scrollToPost(10));
      expect(activeIndex(feed)).toBe(2);
      act(() => ref.current?.scrollToPost(-3));
      expect(activeIndex(feed)).toBe(0);
    });

    it('opens the target post at its top', () => {
      const { ref, feed } = renderFeed();
      const target = scrollerOf(feed, 1);
      target.scrollTop = 200;
      act(() => ref.current?.scrollToPost(1));
      expect(target.scrollTop).toBe(0);
    });
  });

  describe('touch', () => {
    it('moves to the next post on an upward swipe and back on a downward swipe', () => {
      const { feed } = renderFeed();
      swipeUp(feed);
      expect(activeIndex(feed)).toBe(1);
      swipeDown(feed);
      expect(activeIndex(feed)).toBe(0);
    });

    it('does not go above the first post', () => {
      const { feed } = renderFeed();
      swipeDown(feed);
      expect(activeIndex(feed)).toBe(0);
    });

    it('accepts a short but fast flick', () => {
      const { feed } = renderFeed();
      fireEvent.touchStart(feed, { touches: [{ clientX: 100, clientY: 500 }] });
      now += 50;
      fireEvent.touchEnd(feed, { changedTouches: [{ clientX: 100, clientY: 470 }] });
      expect(activeIndex(feed)).toBe(1);
    });

    it('ignores short slow drags, horizontal swipes, multi-touch and cancelled touches', () => {
      const { feed } = renderFeed();

      fireEvent.touchStart(feed, { touches: [{ clientX: 100, clientY: 500 }] });
      now += 1000;
      fireEvent.touchEnd(feed, { changedTouches: [{ clientX: 100, clientY: 470 }] });

      swipe(feed, 500, 400, { dx: 150 });

      fireEvent.touchStart(feed, {
        touches: [
          { clientX: 100, clientY: 500 },
          { clientX: 200, clientY: 500 },
        ],
      });
      fireEvent.touchEnd(feed, { changedTouches: [{ clientX: 100, clientY: 300 }] });

      fireEvent.touchStart(feed, { touches: [{ clientX: 100, clientY: 500 }] });
      fireEvent.touchCancel(feed);
      fireEvent.touchEnd(feed, { changedTouches: [{ clientX: 100, clientY: 300 }] });

      fireEvent.touchStart(feed, { touches: [] });
      fireEvent.touchEnd(feed, { changedTouches: [{ clientX: 100, clientY: 300 }] });

      fireEvent.touchStart(feed, { touches: [{ clientX: 100, clientY: 500 }] });
      fireEvent.touchEnd(feed, { changedTouches: [] });

      expect(activeIndex(feed)).toBe(0);
    });

    it('lets a tall post scroll first and only moves on once the swipe starts at its edge', () => {
      const { feed } = renderFeed();
      const scroller = scrollerOf(feed, 0);
      setSize(scroller, 500, 1200);

      // Mid-post: the swipe scrolls the card natively, the feed stays put.
      scroller.scrollTop = 300;
      swipeUp(feed);
      expect(activeIndex(feed)).toBe(0);

      // At the bottom edge when the finger lands: next post.
      scroller.scrollTop = 700;
      swipeUp(feed);
      expect(activeIndex(feed)).toBe(1);
    });

    it('only goes back from a tall post once it is scrolled to its top', () => {
      const { ref, feed } = renderFeed();
      act(() => ref.current?.scrollToPost(1));
      const scroller = scrollerOf(feed, 1);
      setSize(scroller, 500, 1200);

      scroller.scrollTop = 300;
      swipeDown(feed);
      expect(activeIndex(feed)).toBe(1);

      scroller.scrollTop = 0;
      swipeDown(feed);
      expect(activeIndex(feed)).toBe(0);
    });
  });

  describe('blocked progression', () => {
    it('reports a blocked attempt when swiping past the last post while locked', () => {
      const { ref, feed, onBlockedScrollAttempt } = renderFeed();
      act(() => ref.current?.scrollToPost(2));
      swipeUp(feed);
      expect(activeIndex(feed)).toBe(2);
      expect(onBlockedScrollAttempt).toHaveBeenCalledTimes(1);
    });

    it('does not report while the last post can still scroll', () => {
      const { ref, feed, onBlockedScrollAttempt } = renderFeed();
      act(() => ref.current?.scrollToPost(2));
      setSize(scrollerOf(feed, 2), 500, 1200);
      swipeUp(feed);
      expect(onBlockedScrollAttempt).not.toHaveBeenCalled();
    });

    it('does not report when unlocked or without a handler', () => {
      const unlocked = renderFeed({ isLocked: false, initialIndex: 2 });
      swipeUp(unlocked.feed);
      expect(unlocked.onBlockedScrollAttempt).not.toHaveBeenCalled();
      unlocked.unmount();

      const noHandler = renderFeed({ onBlockedScrollAttempt: undefined, initialIndex: 2 });
      expect(() => swipeUp(noHandler.feed)).not.toThrow();
    });

    it('throttles repeated attempts', () => {
      const { feed, onBlockedScrollAttempt } = renderFeed({ initialIndex: 2 });
      swipeUp(feed);
      swipeUp(feed);
      expect(onBlockedScrollAttempt).toHaveBeenCalledTimes(1);
      now += 3100;
      swipeUp(feed);
      expect(onBlockedScrollAttempt).toHaveBeenCalledTimes(2);
    });
  });

  describe('wheel', () => {
    it('moves one post per wheel gesture at the edge', () => {
      const { feed } = renderFeed();
      fireEvent.wheel(feed, { deltaY: 100 });
      expect(activeIndex(feed)).toBe(1);

      // Trackpad inertia from the same gesture is ignored...
      for (let i = 0; i < 10; i += 1) {
        now += 50;
        fireEvent.wheel(feed, { deltaY: 30 });
      }
      expect(activeIndex(feed)).toBe(1);

      // ...but a new gesture after a pause moves again, in either direction.
      now += 500;
      fireEvent.wheel(feed, { deltaY: -100 });
      expect(activeIndex(feed)).toBe(0);
    });

    it('releases the lock after a long continuous gesture', () => {
      const { feed } = renderFeed();
      fireEvent.wheel(feed, { deltaY: 100 });
      for (let i = 0; i < 40; i += 1) {
        now += 50;
        fireEvent.wheel(feed, { deltaY: 100 });
      }
      expect(activeIndex(feed)).toBe(2);
    });

    it('accumulates small deltas within one gesture and resets on reversal or a pause', () => {
      const { feed } = renderFeed();
      fireEvent.wheel(feed, { deltaY: 30 });
      now += 20;
      fireEvent.wheel(feed, { deltaY: -30 });
      now += 20;
      fireEvent.wheel(feed, { deltaY: 30 });
      now += 400;
      fireEvent.wheel(feed, { deltaY: 30 });
      expect(activeIndex(feed)).toBe(0);
      now += 20;
      fireEvent.wheel(feed, { deltaY: 30 });
      expect(activeIndex(feed)).toBe(1);
    });

    it('lets a tall post scroll natively before moving on', () => {
      const { feed } = renderFeed();
      const scroller = scrollerOf(feed, 0);
      setSize(scroller, 500, 1200);
      scroller.scrollTop = 100;
      fireEvent.wheel(feed, { deltaY: 100 });
      fireEvent.wheel(feed, { deltaY: -100 });
      expect(activeIndex(feed)).toBe(0);
    });

    it('ignores horizontal and empty wheel events', () => {
      const { feed } = renderFeed();
      fireEvent.wheel(feed, { deltaY: 0 });
      fireEvent.wheel(feed, { deltaX: 200, deltaY: 100 });
      expect(activeIndex(feed)).toBe(0);
    });

    it('reports a blocked attempt when wheeling past the last post while locked', () => {
      const { feed, onBlockedScrollAttempt } = renderFeed({ initialIndex: 2 });
      fireEvent.wheel(feed, { deltaY: 100 });
      expect(onBlockedScrollAttempt).toHaveBeenCalledTimes(1);
    });
  });

  describe('scroll hint', () => {
    it('shows while the current post overflows and hides once it is scrolled', () => {
      const { feed } = renderFeed();
      const scroller = scrollerOf(feed, 0);
      setSize(scroller, 500, 900);
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });
      expect(screen.getByText(labels.scrollHint)).toBeInTheDocument();

      scroller.scrollTop = 50;
      fireEvent.scroll(scroller);
      expect(screen.queryByText(labels.scrollHint)).not.toBeInTheDocument();

      // Scrolling back to the top does not bring it back for this post.
      scroller.scrollTop = 0;
      fireEvent.scroll(scroller);
      expect(screen.queryByText(labels.scrollHint)).not.toBeInTheDocument();
    });

    it('is re-evaluated for each post the user moves to', () => {
      const { ref, feed } = renderFeed();
      setSize(scrollerOf(feed, 1), 500, 900);
      expect(screen.queryByText(labels.scrollHint)).not.toBeInTheDocument();
      act(() => ref.current?.scrollToPost(1));
      expect(screen.getByText(labels.scrollHint)).toBeInTheDocument();
    });

    it('stays hidden when the current post fits on screen', () => {
      const { feed } = renderFeed();
      setSize(scrollerOf(feed, 0), 500, 400);
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });
      expect(screen.queryByText(labels.scrollHint)).not.toBeInTheDocument();
    });
  });
});

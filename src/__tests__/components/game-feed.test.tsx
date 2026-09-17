/**
 * Tests for GameFeed: a one-post-per-screen scroll-snap feed. Each unlocked post
 * gets a full-height slot; a post taller than the screen scrolls inside its slot.
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
      renderPost={(id) => <div data-testid={`post-${id}`}>Post {id}</div>}
      isLocked={true}
      labels={labels}
      onActiveIndexChange={onActiveIndexChange}
      onBlockedScrollAttempt={onBlockedScrollAttempt}
      {...props}
    />
  );
  return { ...utils, ref, onActiveIndexChange, onBlockedScrollAttempt };
}

function setSize(el: Element, clientHeight: number, scrollHeight: number) {
  Object.defineProperty(el, 'clientHeight', { value: clientHeight, configurable: true });
  Object.defineProperty(el, 'scrollHeight', { value: scrollHeight, configurable: true });
}

describe('GameFeed', () => {
  beforeEach(() => {
    // Complete the scroll animation in a single frame.
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(performance.now() + 10_000);
      return 1;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders each post in its own full-height snap slot inside one snapping feed', () => {
    renderFeed();
    const feed = screen.getByRole('feed');
    expect(feed).toHaveClass('overflow-y-auto', 'snap-y', 'snap-mandatory', 'scrollbar-none');
    const slots = feed.querySelectorAll('[data-post-index]');
    expect(slots).toHaveLength(3);
    slots.forEach((slot) => {
      expect(slot).toHaveClass('h-full', 'snap-start', 'snap-always');
      // Tall posts scroll inside the slot, with the scrollbar hidden.
      expect(slot.querySelector('[data-post-scroller]')).toHaveClass(
        'overflow-y-auto',
        'scrollbar-none'
      );
    });
    expect(screen.getByTestId('post-a')).toBeInTheDocument();
    expect(screen.getByTestId('post-c')).toBeInTheDocument();
  });

  it('shows the locked hint under the last post while progression is locked', () => {
    renderFeed({ isLocked: true });
    const hint = screen.getByText(labels.lockedHint);
    expect(hint.closest('[data-post-index]')).toHaveAttribute('data-post-index', '2');
  });

  it('hides the locked hint once progression is unlocked', () => {
    renderFeed({ isLocked: false });
    expect(screen.queryByText(labels.lockedHint)).not.toBeInTheDocument();
  });

  it('snaps the feed to the requested post through the imperative handle', () => {
    const { ref } = renderFeed();
    const feed = screen.getByRole('feed');
    setSize(feed, 600, 1800);
    act(() => {
      ref.current?.scrollToPost(1);
    });
    expect(feed.scrollTop).toBe(600);
  });

  it('reports the snapped post as active on scroll', () => {
    const { onActiveIndexChange } = renderFeed();
    const feed = screen.getByRole('feed');
    setSize(feed, 600, 1800);
    feed.scrollTop = 600;

    fireEvent.scroll(feed);

    expect(onActiveIndexChange).toHaveBeenLastCalledWith(1);
  });

  it('fires a blocked-scroll attempt when the user wheels past the end while locked', () => {
    const { onBlockedScrollAttempt } = renderFeed({ isLocked: true });
    const feed = screen.getByRole('feed');
    setSize(feed, 500, 1500);
    feed.scrollTop = 1000; // last slot

    fireEvent.wheel(feed, { deltaY: 40 });

    expect(onBlockedScrollAttempt).toHaveBeenCalledTimes(1);
  });

  it('does not fire a blocked-scroll attempt while the last post can still scroll internally', () => {
    const { onBlockedScrollAttempt } = renderFeed({ isLocked: true });
    const feed = screen.getByRole('feed');
    setSize(feed, 500, 1500);
    feed.scrollTop = 1000;
    const scroller = feed.querySelector('[data-post-index="2"] [data-post-scroller]')!;
    setSize(scroller, 500, 900);
    scroller.scrollTop = 0;

    fireEvent.wheel(feed, { deltaY: 40 });

    expect(onBlockedScrollAttempt).not.toHaveBeenCalled();
  });

  it('does not fire a blocked-scroll attempt when unlocked or not at the end', () => {
    const { onBlockedScrollAttempt, rerender } = renderFeed({ isLocked: true });
    const feed = screen.getByRole('feed');
    setSize(feed, 500, 1500);
    feed.scrollTop = 500; // middle slot

    fireEvent.wheel(feed, { deltaY: 40 });
    expect(onBlockedScrollAttempt).not.toHaveBeenCalled();

    feed.scrollTop = 1000;
    rerender(
      <GameFeed
        postIds={['a', 'b', 'c']}
        renderPost={(id) => <div data-testid={`post-${id}`}>Post {id}</div>}
        isLocked={false}
        labels={labels}
        onActiveIndexChange={jest.fn()}
        onBlockedScrollAttempt={onBlockedScrollAttempt}
      />
    );
    fireEvent.wheel(feed, { deltaY: 40 });
    expect(onBlockedScrollAttempt).not.toHaveBeenCalled();
  });

  it('shows a scroll hint while the current post is taller than its slot and hides it once scrolled', () => {
    renderFeed();
    const feed = screen.getByRole('feed');
    setSize(feed, 500, 1500);
    const scroller = feed.querySelector('[data-post-index="0"] [data-post-scroller]')!;
    setSize(scroller, 500, 900);

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(screen.getByText(labels.scrollHint)).toBeInTheDocument();

    scroller.scrollTop = 50;
    fireEvent.scroll(scroller);
    expect(screen.queryByText(labels.scrollHint)).not.toBeInTheDocument();
  });

  it('does not show the scroll hint when the current post fits on screen', () => {
    renderFeed();
    const feed = screen.getByRole('feed');
    setSize(feed, 500, 1500);
    const scroller = feed.querySelector('[data-post-index="0"] [data-post-scroller]')!;
    setSize(scroller, 500, 400);
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(screen.queryByText(labels.scrollHint)).not.toBeInTheDocument();
  });

  it('renders safely with no posts', () => {
    const { onBlockedScrollAttempt } = renderFeed({ postIds: [] });
    const feed = screen.getByRole('feed');
    expect(feed.querySelectorAll('[data-post-index]')).toHaveLength(0);
    setSize(feed, 500, 500);
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    fireEvent.wheel(feed, { deltaY: 40 });
    expect(screen.queryByText(labels.scrollHint)).not.toBeInTheDocument();
    expect(onBlockedScrollAttempt).toHaveBeenCalledTimes(1);
  });

  it('works in browsers without ResizeObserver', () => {
    const original = global.ResizeObserver;
    // @ts-expect-error simulate an older browser
    delete global.ResizeObserver;
    try {
      const { unmount } = renderFeed();
      expect(screen.getByRole('feed')).toBeInTheDocument();
      unmount();
    } finally {
      global.ResizeObserver = original;
    }
  });

  describe('touch gestures', () => {
    function lockedAtEnd() {
      const utils = renderFeed({ isLocked: true });
      const feed = screen.getByRole('feed');
      setSize(feed, 500, 1500);
      feed.scrollTop = 1000;
      return { ...utils, feed };
    }

    it('fires a blocked-scroll attempt on an upward swipe past the end', () => {
      const { feed, onBlockedScrollAttempt } = lockedAtEnd();
      fireEvent.touchStart(feed, { touches: [{ clientY: 400 }] });
      fireEvent.touchMove(feed, { touches: [{ clientY: 300 }] });
      expect(onBlockedScrollAttempt).toHaveBeenCalledTimes(1);
    });

    it('ignores small moves, downward swipes and touches without a point', () => {
      const { feed, onBlockedScrollAttempt } = lockedAtEnd();
      fireEvent.touchStart(feed, { touches: [] });
      fireEvent.touchMove(feed, { touches: [{ clientY: 100 }] });
      fireEvent.touchStart(feed, { touches: [{ clientY: 400 }] });
      fireEvent.touchMove(feed, { touches: [{ clientY: 390 }] });
      fireEvent.touchMove(feed, { touches: [{ clientY: 500 }] });
      fireEvent.touchMove(feed, { touches: [] });
      expect(onBlockedScrollAttempt).not.toHaveBeenCalled();
    });

    it('throttles repeated attempts and ignores upward wheel movement', () => {
      const { feed, onBlockedScrollAttempt } = lockedAtEnd();
      fireEvent.wheel(feed, { deltaY: -40 });
      expect(onBlockedScrollAttempt).not.toHaveBeenCalled();
      fireEvent.wheel(feed, { deltaY: 40 });
      fireEvent.wheel(feed, { deltaY: 40 });
      fireEvent.touchStart(feed, { touches: [{ clientY: 400 }] });
      fireEvent.touchMove(feed, { touches: [{ clientY: 300 }] });
      expect(onBlockedScrollAttempt).toHaveBeenCalledTimes(1);
    });
  });

  describe('scroll animation', () => {
    function manualFrames() {
      jest.restoreAllMocks();
      const frames: FrameRequestCallback[] = [];
      jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        frames.push(cb);
        return frames.length;
      });
      return frames;
    }

    function sizedFeed() {
      const utils = renderFeed();
      const feed = screen.getByRole('feed');
      setSize(feed, 600, 1800);
      return { ...utils, feed };
    }

    afterEach(() => {
      jest.useRealTimers();
    });

    it('animates over several frames with the snap lifted, then restores it', () => {
      const frames = manualFrames();
      jest.spyOn(performance, 'now').mockReturnValue(1000);
      const { ref, feed, onActiveIndexChange } = sizedFeed();

      act(() => ref.current?.scrollToPost(2));
      expect(feed.style.scrollSnapType).toBe('none');

      act(() => frames.shift()!(1100));
      expect(feed.scrollTop).toBeGreaterThan(0);
      expect(feed.scrollTop).toBeLessThan(1200);
      expect(feed.style.scrollSnapType).toBe('none');

      act(() => frames.shift()!(5000));
      expect(feed.scrollTop).toBe(1200);
      expect(feed.style.scrollSnapType).toBe('');
      expect(onActiveIndexChange).toHaveBeenLastCalledWith(2);
    });

    it('finishes through the safety timer when frames never arrive', () => {
      jest.useFakeTimers();
      manualFrames();
      const { ref, feed, onActiveIndexChange } = sizedFeed();

      act(() => ref.current?.scrollToPost(1));
      expect(feed.scrollTop).toBe(0);

      act(() => {
        jest.runOnlyPendingTimers();
      });
      expect(feed.scrollTop).toBe(600);
      expect(feed.style.scrollSnapType).toBe('');
      expect(onActiveIndexChange).toHaveBeenLastCalledWith(1);
    });

    it('ignores frames from a jump that was superseded', () => {
      const frames = manualFrames();
      const { ref, feed } = sizedFeed();

      act(() => {
        ref.current?.scrollToPost(2);
        ref.current?.scrollToPost(1);
      });
      act(() => frames.forEach((cb) => cb(performance.now() + 10_000)));
      expect(feed.scrollTop).toBe(600);
    });

    it("does not let a superseded jump's safety timer undo a later jump", () => {
      // Regression: only the old frame loop used to be cancelled, so the old
      // safety timer later snapped the feed back to the stale target.
      jest.useFakeTimers();
      manualFrames();
      const { ref, feed } = sizedFeed();

      act(() => ref.current?.scrollToPost(2)); // stale target 1200, timer at 700ms
      act(() => {
        jest.advanceTimersByTime(100);
      });
      act(() => ref.current?.scrollToPost(1)); // live target 600, timer at 800ms

      act(() => {
        jest.advanceTimersByTime(650); // past the stale deadline only
      });
      expect(feed.scrollTop).not.toBe(1200);

      act(() => {
        jest.advanceTimersByTime(100);
      });
      expect(feed.scrollTop).toBe(600);
    });

    it('leaves no timer armed after the feed unmounts mid-jump', () => {
      jest.useFakeTimers();
      manualFrames();
      const { ref, unmount } = sizedFeed();
      act(() => ref.current?.scrollToPost(2));
      expect(jest.getTimerCount()).toBeGreaterThan(0);

      unmount();
      expect(jest.getTimerCount()).toBe(0);
    });

    it('jumps instantly when the viewer prefers reduced motion', () => {
      const frames = manualFrames();
      (window.matchMedia as jest.Mock).mockImplementationOnce((query: string) => ({
        matches: query.includes('reduce'),
        media: query,
      }));
      const { ref, feed, onActiveIndexChange } = sizedFeed();

      act(() => ref.current?.scrollToPost(2));
      expect(feed.scrollTop).toBe(1200);
      expect(frames).toHaveLength(0);
      expect(onActiveIndexChange).toHaveBeenLastCalledWith(2);
    });

    it('clamps the requested index to the available posts', () => {
      const { ref, feed } = sizedFeed();
      act(() => ref.current?.scrollToPost(10));
      expect(feed.scrollTop).toBe(1200);
      act(() => ref.current?.scrollToPost(-3));
      expect(feed.scrollTop).toBe(0);
    });
  });
});

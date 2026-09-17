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
});

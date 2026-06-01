import { renderHook, act } from '@testing-library/react';
import { useCredibilityStore } from './use-credibility-store';

describe('useCredibilityStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    act(() => {
      useCredibilityStore.setState({
        points: 0,
        credibility: 0,
        initialCredibility: 0,
        earnedBadges: [],
        clickedLinks: [],
      });
    });
  });

  it('should have initial point value of 0', () => {
    const { result } = renderHook(() => useCredibilityStore());
    expect(result.current.points).toBe(0);
  });

  it('should have initial credibility value of 80', () => {
    const { result } = renderHook(() => useCredibilityStore());
    expect(result.current.credibility).toBe(0);
    expect(result.current.initialCredibility).toBe(0);
  });

  it('should update point value using addPoint', () => {
    const { result } = renderHook(() => useCredibilityStore());

    act(() => {
      result.current.addPoints(100);
      result.current.addPoints(10);
    });

    expect(result.current.points).toBe(110);
  });

  it('should update credibility value using initCredibility', () => {
    const { result } = renderHook(() => useCredibilityStore());

    act(() => {
      result.current.initCredibility(50);
    });

    expect(result.current.credibility).toBe(25);
  });

  it('should allow setting point to 0', () => {
    const { result } = renderHook(() => useCredibilityStore());

    act(() => {
      result.current.addPoints(0);
    });

    expect(result.current.points).toBe(0);
  });

  it('should allow setting credibility to 0', () => {
    const { result } = renderHook(() => useCredibilityStore());

    act(() => {
      result.current.initCredibility(0);
    });

    expect(result.current.credibility).toBe(0);
  });

  it('should allow setting point to negative values', () => {
    const { result } = renderHook(() => useCredibilityStore());

    act(() => {
      result.current.addPoints(-50);
    });

    expect(result.current.points).toBe(-50);
  });

  it('should allow setting credibility to values over 100', () => {
    const { result } = renderHook(() => useCredibilityStore());

    act(() => {
      result.current.initCredibility(150);
    });

    expect(result.current.credibility).toBe(75);
  });

  it('should allow multiple hooks to access the same store', () => {
    const { result: result1 } = renderHook(() => useCredibilityStore());
    const { result: result2 } = renderHook(() => useCredibilityStore());

    act(() => {
      result1.current.addPoints(100);
      result1.current.initCredibility(70);
    });

    // Both hooks should see the same state
    expect(result1.current.points).toBe(100);
    expect(result1.current.credibility).toBe(35);
    expect(result2.current.points).toBe(100);
    expect(result2.current.credibility).toBe(35);
  });

  it('should allow using selector to get specific values', () => {
    const { result: pointResult } = renderHook(() => useCredibilityStore((state) => state.points));
    const { result: credibilityResult } = renderHook(() =>
      useCredibilityStore((state) => state.credibility)
    );

    act(() => {
      useCredibilityStore.getState().addPoints(150);
      useCredibilityStore.getState().initCredibility(65);
    });

    expect(pointResult.current).toBe(150);
    expect(credibilityResult.current).toBe(32);
  });

  it('should expose addPoints and setCredibility functions', () => {
    const { result } = renderHook(() => useCredibilityStore());

    expect(typeof result.current.addPoints).toBe('function');
    expect(typeof result.current.initCredibility).toBe('function');
  });


it('should calculate initial credibility using Math.floor(total / 2)', () => {
    const { result } = renderHook(() => useCredibilityStore());

    act(() => {
      result.current.initCredibility(5); // Math.floor(5 / 2) = 2
    });

    expect(result.current.initialCredibility).toBe(2);
    expect(result.current.credibility).toBe(2);
  });

  it('should not overwrite initial credibility once it has been initialized', () => {
    const { result } = renderHook(() => useCredibilityStore());

    act(() => {
      result.current.initCredibility(5); // sets to 2
      result.current.initCredibility(10); // should be skipped
    });

    expect(result.current.initialCredibility).toBe(2);
    expect(result.current.credibility).toBe(2);
  });

  it('should incrementally accumulate points using addPoints', () => {
    const { result } = renderHook(() => useCredibilityStore());

    act(() => {
      result.current.addPoints(5);
      result.current.addPoints(10);
    });

    expect(result.current.points).toBe(15);
  });

  describe('updateBadges milestones', () => {
    it('should award badge 0 when progress is >= 33%', () => {
      const { result } = renderHook(() => useCredibilityStore());

      act(() => {
        result.current.initCredibility(3); // 3 questions total
        result.current.addPoints(5); // 1 correct answer (5 pts) -> progress ~33.3%
        result.current.updateBadges(3);
      });

      expect(result.current.earnedBadges).toEqual([0]);
    });

    it('should award badge 1 when progress is >= 66%', () => {
      const { result } = renderHook(() => useCredibilityStore());

      act(() => {
        result.current.initCredibility(3);
        result.current.addPoints(10); // 2 correct answers (10 pts) -> progress ~66.6%
        result.current.updateBadges(3);
      });

      expect(result.current.earnedBadges).toEqual([0, 1]);
    });

    it('should award badge 2 when progress hits exactly 100%', () => {
      const { result } = renderHook(() => useCredibilityStore());

      act(() => {
        result.current.initCredibility(2); // 2 questions total
        result.current.addPoints(10); // 2 correct answers (10 pts) -> progress 100%
        result.current.updateBadges(2);
      });

      expect(result.current.earnedBadges).toEqual([0, 1, 2]);
    });
  });

  describe('recordLinkClick unique tracking', () => {
    it('should return true and store the string entry if unique within current state runtime', () => {
      const { result } = renderHook(() => useCredibilityStore());
      let trackingOutput: boolean | undefined;

      act(() => {
        trackingOutput = result.current.recordLinkClick('https://example.com/source');
      });

      expect(trackingOutput).toBe(true);
      expect(result.current.clickedLinks).toEqual(['https://example.com/source']);
    });

    it('should return false and block duplicates from being saved twice', () => {
      const { result } = renderHook(() => useCredibilityStore());
      let firstClick: boolean | undefined;
      let secondClick: boolean | undefined;

      act(() => {
        firstClick = result.current.recordLinkClick('https://example.com/source');
        secondClick = result.current.recordLinkClick('https://example.com/source');
      });

      expect(firstClick).toBe(true);
      expect(secondClick).toBe(false);
      expect(result.current.clickedLinks).toHaveLength(1);
    });
  });
});

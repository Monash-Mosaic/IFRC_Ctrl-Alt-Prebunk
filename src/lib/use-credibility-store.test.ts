import { renderHook, act } from '@testing-library/react';
import { useCredibilityStore } from './use-credibility-store';

describe('useCredibilityStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    const { result } = renderHook(() => useCredibilityStore());
    act(() => {
      result.current.setPoint(0);
      result.current.setCredibility(80);
    });
  });

  it('should have initial point value of 0', () => {
    const { result } = renderHook(() => useCredibilityStore());
    expect(result.current.point).toBe(0);
  });

  it('should have initial credibility value of 80', () => {
    const { result } = renderHook(() => useCredibilityStore());
    expect(result.current.credibility).toBe(80);
  });

  it('should update point value using setPoint', () => {
    const { result } = renderHook(() => useCredibilityStore());

    act(() => {
      result.current.setPoint(100);
    });

    expect(result.current.point).toBe(100);
  });

  it('should update credibility value using setCredibility', () => {
    const { result } = renderHook(() => useCredibilityStore());

    act(() => {
      result.current.setCredibility(50);
    });

    expect(result.current.credibility).toBe(50);
  });

  it('should allow setting point to 0', () => {
    const { result } = renderHook(() => useCredibilityStore());

    act(() => {
      result.current.setPoint(100);
      result.current.setPoint(0);
    });

    expect(result.current.point).toBe(0);
  });

  it('should allow setting credibility to 0', () => {
    const { result } = renderHook(() => useCredibilityStore());

    act(() => {
      result.current.setCredibility(0);
    });

    expect(result.current.credibility).toBe(0);
  });

  it('should allow setting point to negative values', () => {
    const { result } = renderHook(() => useCredibilityStore());

    act(() => {
      result.current.setPoint(-50);
    });

    expect(result.current.point).toBe(-50);
  });

  it('should allow setting credibility to values over 100', () => {
    const { result } = renderHook(() => useCredibilityStore());

    act(() => {
      result.current.setCredibility(150);
    });

    expect(result.current.credibility).toBe(150);
  });

  it('should update point and credibility independently', () => {
    const { result } = renderHook(() => useCredibilityStore());

    act(() => {
      result.current.setPoint(200);
      result.current.setCredibility(60);
    });

    expect(result.current.point).toBe(200);
    expect(result.current.credibility).toBe(60);
  });

  it('should maintain state across multiple updates', () => {
    const { result } = renderHook(() => useCredibilityStore());

    act(() => {
      result.current.setPoint(10);
      result.current.setCredibility(90);
      result.current.setPoint(20);
      result.current.setCredibility(85);
    });

    expect(result.current.point).toBe(20);
    expect(result.current.credibility).toBe(85);
  });

  it('should allow multiple hooks to access the same store', () => {
    const { result: result1 } = renderHook(() => useCredibilityStore());
    const { result: result2 } = renderHook(() => useCredibilityStore());

    act(() => {
      result1.current.setPoint(100);
      result1.current.setCredibility(70);
    });

    // Both hooks should see the same state
    expect(result1.current.point).toBe(100);
    expect(result1.current.credibility).toBe(70);
    expect(result2.current.point).toBe(100);
    expect(result2.current.credibility).toBe(70);
  });

  it('should allow using selector to get specific values', () => {
    const { result: pointResult } = renderHook(() => useCredibilityStore((state) => state.point));
    const { result: credibilityResult } = renderHook(() =>
      useCredibilityStore((state) => state.credibility)
    );

    act(() => {
      useCredibilityStore.getState().setPoint(150);
      useCredibilityStore.getState().setCredibility(65);
    });

    expect(pointResult.current).toBe(150);
    expect(credibilityResult.current).toBe(65);
  });

  it('should expose setPoint and setCredibility functions', () => {
    const { result } = renderHook(() => useCredibilityStore());

    expect(typeof result.current.setPoint).toBe('function');
    expect(typeof result.current.setCredibility).toBe('function');
  });
});

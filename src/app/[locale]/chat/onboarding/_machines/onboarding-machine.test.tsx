import { act, renderHook } from '@testing-library/react';
import { useOnboardingMachine, type OnboardingOptionEvent } from './onboarding-machine';

const FIXED_DATE = new Date('2020-08-20T00:12:00.000Z').getTime();

// Helper to normalize state for snapshots by replacing dynamic fields with expect.any() matchers
// Jest serializes expect.any() to "Any<String>" and "Any<Number>" in snapshots
const normalizeForSnapshot = (state: any) => {
  const normalized = JSON.parse(JSON.stringify(state));
  if (normalized.context?.messages) {
    normalized.context.messages = normalized.context.messages.map((msg: any) => {
      const { id, timestamp, ...rest } = msg;
      return {
        ...rest,
        id: expect.any(String),
        timestamp: expect.any(Number),
      };
    });
  }
  return normalized;
};

describe('onboardingMachine', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_DATE);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.setSystemTime(FIXED_DATE);
  });

  it('matches snapshot after typing timeout shows greeting message', () => {
    const { result } = renderHook(() => useOnboardingMachine());

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    const normalized = normalizeForSnapshot(result.current[0]);
    expect(normalized).toMatchSnapshot();
  });

  it('matches snapshot when selecting option1 in step1 (completes immediately)', () => {
    const { result } = renderHook(() => useOnboardingMachine());

    act(() =>
      result.current[1]({
        type: 'option1-step1',
        optionText: "Let's go",
      } as OnboardingOptionEvent)
    );

    const normalized = normalizeForSnapshot(result.current[0]);
    expect(normalized).toMatchSnapshot();
  });

  it('matches snapshot following step1 -> step2 -> step3 path', () => {
    const { result } = renderHook(() => useOnboardingMachine());

    act(() =>
      result.current[1]({
        type: 'option2-step1',
        optionText: 'Option 2',
      } as OnboardingOptionEvent)
    );
    const normalized1 = normalizeForSnapshot(result.current[0]);
    expect(normalized1).toMatchSnapshot('after step1 -> step2');

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    const normalized2 = normalizeForSnapshot(result.current[0]);
    expect(normalized2).toMatchSnapshot('after step2 typing timeout');

    act(() =>
      result.current[1]({
        type: 'option2-step2',
        optionText: 'Option 2',
      } as OnboardingOptionEvent)
    );
    const normalized3 = normalizeForSnapshot(result.current[0]);
    expect(normalized3).toMatchSnapshot('after step2 -> step3');

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    const normalized4 = normalizeForSnapshot(result.current[0]);
    expect(normalized4).toMatchSnapshot('after step3 typing timeout');
  });

  it('matches snapshot going through example and completing after delay', () => {
    const { result } = renderHook(() => useOnboardingMachine());

    act(() =>
      result.current[1]({
        type: 'option2-step1',
        optionText: 'Option 2',
      } as OnboardingOptionEvent)
    );
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    act(() =>
      result.current[1]({
        type: 'option2-step2',
        optionText: 'Option 2',
      } as OnboardingOptionEvent)
    );
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    act(() =>
      result.current[1]({
        type: 'option2-step3',
        optionText: 'Option 2',
      } as OnboardingOptionEvent)
    );

    const normalized1 = normalizeForSnapshot(result.current[0]);
    expect(normalized1).toMatchSnapshot('after selecting option2-step3 (example state)');

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    const normalized2 = normalizeForSnapshot(result.current[0]);
    expect(normalized2).toMatchSnapshot('after example typing timeout');

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    const normalized3 = normalizeForSnapshot(result.current[0]);
    expect(normalized3).toMatchSnapshot('after auto-complete (completed state)');
  });

  it('matches snapshot accumulating user messages when selecting options', () => {
    const { result } = renderHook(() => useOnboardingMachine());

    act(() =>
      result.current[1]({
        type: 'option2-step1',
        optionText: 'Option 2',
      } as OnboardingOptionEvent)
    );
    const normalized1 = normalizeForSnapshot(result.current[0]);
    expect(normalized1).toMatchSnapshot('after first option selection');

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    act(() =>
      result.current[1]({
        type: 'option2-step2',
        optionText: 'Option 2',
      } as OnboardingOptionEvent)
    );
    const normalized2 = normalizeForSnapshot(result.current[0]);
    expect(normalized2).toMatchSnapshot('after second option selection');
  });
});

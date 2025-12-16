import { act, renderHook } from '@testing-library/react';
import { useOnboardingMachine, type OnboardingOptionEvent } from './onboarding-machine';

jest.useFakeTimers();

describe('onboardingMachine', () => {
  it('matches snapshot with initial state', () => {
    const { result } = renderHook(() => useOnboardingMachine());

    expect(result.current[0]).toMatchSnapshot();
  });

  it('matches snapshot after typing timeout shows greeting message', () => {
    const { result } = renderHook(() => useOnboardingMachine());

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current[0]).toMatchSnapshot();
  });

  it('matches snapshot when selecting option1 in step1 (completes immediately)', () => {
    const { result } = renderHook(() => useOnboardingMachine());

    act(() =>
      result.current[1]({
        type: 'option1-step1',
        optionText: "Let's go",
      } as OnboardingOptionEvent)
    );

    expect(result.current[0]).toMatchSnapshot();
  });

  it('matches snapshot following step1 -> step2 -> step3 path', () => {
    const { result } = renderHook(() => useOnboardingMachine());

    act(() =>
      result.current[1]({
        type: 'option2-step1',
        optionText: 'Option 2',
      } as OnboardingOptionEvent)
    );
    expect(result.current[0]).toMatchSnapshot('after step1 -> step2');

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current[0]).toMatchSnapshot('after step2 typing timeout');

    act(() =>
      result.current[1]({
        type: 'option2-step2',
        optionText: 'Option 2',
      } as OnboardingOptionEvent)
    );
    expect(result.current[0]).toMatchSnapshot('after step2 -> step3');

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current[0]).toMatchSnapshot('after step3 typing timeout');
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

    expect(result.current[0]).toMatchSnapshot('after selecting option2-step3 (example state)');

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current[0]).toMatchSnapshot('after example typing timeout');

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(result.current[0]).toMatchSnapshot('after auto-complete (completed state)');
  });

  it('matches snapshot accumulating user messages when selecting options', () => {
    const { result } = renderHook(() => useOnboardingMachine());

    act(() =>
      result.current[1]({
        type: 'option2-step1',
        optionText: 'Option 2',
      } as OnboardingOptionEvent)
    );
    expect(result.current[0]).toMatchSnapshot('after first option selection');

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    act(() =>
      result.current[1]({
        type: 'option1-step2',
        optionText: 'Option 1',
      } as OnboardingOptionEvent)
    );
    expect(result.current[0]).toMatchSnapshot('after second option selection');
  });
});

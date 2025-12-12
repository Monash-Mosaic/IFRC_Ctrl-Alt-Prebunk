import { act, renderHook } from "@testing-library/react";
import { useOnboardingMachine } from "./onboardingMachine";
import type { Message } from "./onboardingMachine";

jest.useFakeTimers();

describe("onboardingMachine", () => {
  it("starts with initial greeting message", () => {
    const { result } = renderHook(() => useOnboardingMachine());

    expect(result.current[0].value).toBe("initial");
    expect(result.current[0].context.messages).toHaveLength(1);
    const firstMessage = result.current[0].context.messages[0];
    expect(firstMessage?.type === "text" ? firstMessage.text : undefined).toBe(
      "step1.greeting"
    );
  });

  it("goes to completed when selecting option1 in step1", () => {
    const { result } = renderHook(() => useOnboardingMachine());

    act(() =>
      result.current[1]({
        type: "option1-step1",
        optionText: "Let's go",
      })
    );

    expect(result.current[0].value).toBe("completed");
    expect(result.current[0].context.selectedOptions).toContain("option1-step1");
  });

  it("follows step1 -> step2 -> step3 path", () => {
    const { result } = renderHook(() => useOnboardingMachine());

    act(() =>
      result.current[1]({
        type: "option2-step1",
        optionText: "Option 2",
      })
    );
    expect(result.current[0].value).toBe("step2");

    act(() =>
      result.current[1]({
        type: "option2-step2",
        optionText: "Option 2",
      })
    );
    expect(result.current[0].value).toBe("step3");
  });

  it("goes through example and completes after delay", () => {
    const { result } = renderHook(() => useOnboardingMachine());

    act(() =>
      result.current[1]({
        type: "option2-step1",
        optionText: "Option 2",
      })
    );
    act(() =>
      result.current[1]({
        type: "option2-step2",
        optionText: "Option 2",
      })
    );
    act(() =>
      result.current[1]({
        type: "option2-step3",
        optionText: "Option 2",
      })
    );

    expect(result.current[0].value).toBe("example");

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(result.current[0].value).toBe("completed");
  });

  it("accumulates user messages when selecting options", () => {
    const { result } = renderHook(() => useOnboardingMachine());

    act(() =>
      result.current[1]({
        type: "option2-step1",
        optionText: "Option 2",
      })
    );
    act(() =>
      result.current[1]({
        type: "option1-step2",
        optionText: "Option 1",
      })
    );

    // Initial Paula message + two user messages + step2 Paula message
    expect(result.current[0].context.messages.length).toBeGreaterThanOrEqual(3);
    expect(
      result.current[0].context.messages.some(
        (m: Message) => m.sender === "user"
      )
    ).toBe(true);
  });
});








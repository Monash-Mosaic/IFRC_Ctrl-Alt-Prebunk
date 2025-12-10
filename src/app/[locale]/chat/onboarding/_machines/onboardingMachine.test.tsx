import { createActor } from "xstate";
import { onboardingMachine } from "./onboardingMachine";

jest.useFakeTimers();

describe("onboardingMachine", () => {
  it("starts with initial greeting message", () => {
    const actor = createActor(onboardingMachine).start();
    const snapshot = actor.getSnapshot();

    expect(snapshot.value).toBe("initial");
    expect(snapshot.context.messages).toHaveLength(1);
    expect(snapshot.context.messages[0].text).toBe("step1.greeting");
  });

  it("goes to completed when selecting option1 in step1", () => {
    const actor = createActor(onboardingMachine).start();
    actor.send({ type: "SELECT_OPTION", optionId: "option1-step1", optionText: "Let's go" });

    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe("completed");
    expect(snapshot.context.selectedOptions).toContain("option1-step1");
  });

  it("follows step1 -> step2 -> step3 path", () => {
    const actor = createActor(onboardingMachine).start();
    actor.send({ type: "SELECT_OPTION", optionId: "option2-step1", optionText: "Option 2" });
    let snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe("step2");

    actor.send({ type: "SELECT_OPTION", optionId: "option3-step2", optionText: "Option 3" });
    snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe("step3");
  });

  it("goes through example and completes after delay", () => {
    const actor = createActor(onboardingMachine).start();
    actor.send({ type: "SELECT_OPTION", optionId: "option2-step1", optionText: "Option 2" });
    actor.send({ type: "SELECT_OPTION", optionId: "option2-step2", optionText: "Option 2" });
    actor.send({ type: "SELECT_OPTION", optionId: "option2-step3", optionText: "Option 2" });

    let snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe("example");

    // advance timers to trigger after transition
    jest.advanceTimersByTime(2000);
    snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe("completed");
  });

  it("accumulates user messages when selecting options", () => {
    const actor = createActor(onboardingMachine).start();
    actor.send({ type: "SELECT_OPTION", optionId: "option2-step1", optionText: "Option 2" });
    actor.send({ type: "SELECT_OPTION", optionId: "option1-step2", optionText: "Option 1" });

    const snapshot = actor.getSnapshot();
    // Initial Paula message + two user messages + step2 Paula message
    expect(snapshot.context.messages.length).toBeGreaterThanOrEqual(3);
    expect(snapshot.context.messages.some((m) => m.sender === "user")).toBe(true);
  });
});








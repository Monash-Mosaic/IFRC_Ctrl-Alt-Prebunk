import type React from "react";
import useStateMachine, { t } from "@cassiozen/usestatemachine";
import EchoPost from "../_icons/EchoPost.mdx";

export type MessageSender = "paula" | "echo" | "user";

export interface BaseMessage {
  id: string;
  sender: MessageSender;
  type: string;
  timestamp: number;
}

export interface TextMessage extends BaseMessage {
  type: "text";
  text: string;
}

export interface PostMessage extends BaseMessage {
  type: "post";
  post: {
    name: string;
    handle: string;
    content: React.ReactNode;
    mediaUrl?: string;
    mediaType?: "image" | "video";
  };
}

export type Message = TextMessage | PostMessage;

export interface OnboardingContext {
  messages: Message[];
  selectedOptions: string[];
}

export type OnboardingOptionEvent = {
  type:
    | "option1-step1"
    | "option2-step1"
    | "option3-step1"
    | "option1-step2"
    | "option2-step2"
    | "option3-step2"
    | "option1-step3"
    | "option2-step3";
  optionText: string;
};

export type OnboardingEvent =
  | OnboardingOptionEvent
  | { type: "RESTORE_STATE"; state: OnboardingContext }
  | { type: "AUTO_COMPLETE" };

const createMessage = (sender: MessageSender, text: string): TextMessage => ({
  id: `msg-${Date.now()}-${Math.random()}`,
  sender,
  type: "text",
  text,
  timestamp: Date.now(),
});

export const createPostMessage = (
  sender: MessageSender,
  post: PostMessage["post"]
): PostMessage => ({
  id: `msg-${Date.now()}-${Math.random()}`,
  sender,
  type: "post",
  post,
  timestamp: Date.now(),
});

const appendUserSelection = (
  context: OnboardingContext,
  event: OnboardingOptionEvent
): OnboardingContext => ({
  ...context,
  messages: [...context.messages, createMessage("user", event.optionText)],
  selectedOptions: [...context.selectedOptions, event.type],
});

type EffectArgs = {
  context: OnboardingContext;
  event?: OnboardingEvent;
  setContext: (
    updater: (context: OnboardingContext) => OnboardingContext
  ) => void;
  send: (event: OnboardingEvent) => void;
};

export const useOnboardingMachine = () => useStateMachine({
  id: "onboarding",
  schema: {
    context: t<OnboardingContext>(),
    events: {
      
    },
  },
  context: {
    messages: [createMessage("paula", "step1.greeting")],
    selectedOptions: [],
  },
  initial: "initial",
  states: {
    initial: {
      on: {
        "option1-step1": "completed",
        "option2-step1": "step2",
        "option3-step1": "step2",
      },
    },
    step2: {
      effect({ setContext, event }: EffectArgs) {
        if (!event || event.type === "AUTO_COMPLETE" || event.type === "RESTORE_STATE") return;

        setContext((context: OnboardingContext) => {
          const withSelection = appendUserSelection(context, event);

          return {
            ...withSelection,
            messages: [
              ...withSelection.messages,
              createMessage("paula", "step2.explanation"),
            ],
          };
        });
      },
      on: {
        "option1-step2": "completed",
        "option2-step2": "step3",
        "option3-step2": "step3",
        AUTO_COMPLETE: "completed",
      },
    },
    step3: {
      effect({ setContext, event }: EffectArgs) {
        if (!event || event.type === "AUTO_COMPLETE" || event.type === "RESTORE_STATE") return;

        setContext((context: OnboardingContext) => {
          const withSelection = appendUserSelection(context, event);

          return {
            ...withSelection,
            messages: [
              ...withSelection.messages,
              createMessage("paula", "step3.tips"),
            ],
          };
        });
      },
      on: {
        "option1-step3": "completed",
        "option2-step3": "example",
      },
    },
    example: {
      effect({ setContext, event, send }: EffectArgs) {
        if (!event || event.type === "AUTO_COMPLETE" || event.type === "RESTORE_STATE") return;

        setContext((context: OnboardingContext) => {
          const updated = appendUserSelection(context, event);
          return {
            ...updated,
            messages: [
              ...updated.messages,
              createMessage("paula", "example.message"),
              createPostMessage("echo", {
                name: "Echo",
                handle: "@climate_truth_warrior",
                content: <EchoPost />,
                mediaUrl: "/images/example/echo-post-img.jpg",
                mediaType: "image",
              }),
            ],
          };
        });

        const timeout = setTimeout(() => send({ type: "AUTO_COMPLETE" }), 2000);
        return () => clearTimeout(timeout);
      },
      on: {
        AUTO_COMPLETE: "completed",
      },
    },
    completed: {
      effect({ setContext, event }: EffectArgs) {
        setContext((context: OnboardingContext) => {
          const baseContext =
            event && event.type !== "AUTO_COMPLETE" && event.type !== "RESTORE_STATE"
              ? appendUserSelection(context, event as OnboardingOptionEvent)
              : context;

          return {
            ...baseContext,
            messages: [
              ...baseContext.messages,
              createMessage("paula", "completed.message"),
            ],
          };
        });
      },
      type: "final",
    },
  },
});

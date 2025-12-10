import { setup, assign } from "xstate";

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
    text: string;
    imageUrl: string;
    videoUrl: string;
    audioUrl: string;
    linkUrl: string;
  };
}

export type Message = TextMessage | PostMessage;

export interface OnboardingContext {
  messages: Message[];
  selectedOptions: string[];
}

export type OnboardingEvent =
  | { type: "SELECT_OPTION"; optionId: string; optionText: string }
  | { type: "RESTORE_STATE"; state: OnboardingContext };

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

export const onboardingMachine = setup({
  types: {
    context: {} as OnboardingContext,
    events: {} as OnboardingEvent,
  },
}).createMachine({
  id: "onboarding",
  initial: "initial",
  context: {
    messages: [],
    selectedOptions: [],
  },
  states: {
    initial: {
      entry: assign({
        messages: ({ context }) => [
          ...context.messages,
          createMessage("paula", "step1.greeting"),
        ],
      }),
      on: {
        SELECT_OPTION: [
          {
            guard: ({ event }) =>
              event.type === "SELECT_OPTION" && event.optionId === "option1-step1",
            target: "completed",
            actions: [
              assign({
                messages: ({ context, event }) => [
                  ...context.messages,
                  createMessage(
                    "user",
                    event.type === "SELECT_OPTION" ? event.optionText : ""
                  ),
                ],
              }),
              assign({
                selectedOptions: ({ context, event }) => [
                  ...context.selectedOptions,
                  event.type === "SELECT_OPTION" ? event.optionId : "",
                ],
              }),
            ],
          },
          {
            guard: ({ event }) =>
              event.type === "SELECT_OPTION" &&
              (event.optionId === "option2-step1" ||
                event.optionId === "option3-step1"),
            target: "step2",
            actions: [
              assign({
                messages: ({ context, event }) => [
                  ...context.messages,
                  createMessage(
                    "user",
                    event.type === "SELECT_OPTION" ? event.optionText : ""
                  ),
                ],
              }),
              assign({
                selectedOptions: ({ context, event }) => [
                  ...context.selectedOptions,
                  event.type === "SELECT_OPTION" ? event.optionId : "",
                ],
              }),
            ],
          },
        ],
      },
    },
    step2: {
      entry: assign({
        messages: ({ context }) => [
          ...context.messages,
          createMessage("paula", "step2.explanation"),
        ],
      }),
      on: {
        SELECT_OPTION: [
          {
            guard: ({ event }) =>
              event.type === "SELECT_OPTION" && event.optionId === "option1-step2",
            target: "completed",
            actions: [
              assign({
                messages: ({ context, event }) => [
                  ...context.messages,
                  createMessage(
                    "user",
                    event.type === "SELECT_OPTION" ? event.optionText : ""
                  ),
                ],
              }),
              assign({
                selectedOptions: ({ context, event }) => [
                  ...context.selectedOptions,
                  event.type === "SELECT_OPTION" ? event.optionId : "",
                ],
              }),
            ],
          },
          {
            guard: ({ event }) =>
              event.type === "SELECT_OPTION" &&
              (event.optionId === "option2-step2" ||
                event.optionId === "option3-step2"),
            target: "step3",
            actions: [
              assign({
                messages: ({ context, event }) => [
                  ...context.messages,
                  createMessage(
                    "user",
                    event.type === "SELECT_OPTION" ? event.optionText : ""
                  ),
                ],
              }),
              assign({
                selectedOptions: ({ context, event }) => [
                  ...context.selectedOptions,
                  event.type === "SELECT_OPTION" ? event.optionId : "",
                ],
              }),
            ],
          },
        ],
      },
    },
    step3: {
      entry: assign({
        messages: ({ context }) => [
          ...context.messages,
          createMessage("paula", "step3.tips"),
        ],
      }),
      on: {
        SELECT_OPTION: [
          {
            guard: ({ event }) =>
              event.type === "SELECT_OPTION" && event.optionId === "option1-step3",
            target: "completed",
            actions: [
              assign({
                messages: ({ context, event }) => [
                  ...context.messages,
                  createMessage(
                    "user",
                    event.type === "SELECT_OPTION" ? event.optionText : ""
                  ),
                ],
              }),
              assign({
                selectedOptions: ({ context, event }) => [
                  ...context.selectedOptions,
                  event.type === "SELECT_OPTION" ? event.optionId : "",
                ],
              }),
            ],
          },
          {
            guard: ({ event }) =>
              event.type === "SELECT_OPTION" && event.optionId === "option2-step3",
            target: "example",
            actions: [
              assign({
                messages: ({ context, event }) => [
                  ...context.messages,
                  createMessage(
                    "user",
                    event.type === "SELECT_OPTION" ? event.optionText : ""
                  ),
                ],
              }),
              assign({
                selectedOptions: ({ context, event }) => [
                  ...context.selectedOptions,
                  event.type === "SELECT_OPTION" ? event.optionId : "",
                ],
              }),
            ],
          },
        ],
      },
    },
    example: {
      entry: assign({
        messages: ({ context }) => [
          ...context.messages,
          createMessage("paula", "example.message"),
        ],
      }),
      after: {
        2000: {
          target: "completed",
        },
      },
    },
    completed: {
      entry: assign({
        messages: ({ context }) => [
          ...context.messages,
          createMessage("paula", "completed.message"),
        ],
      }),
      type: "final",
    },
  },
});

import useStateMachine, { t } from '@cassiozen/usestatemachine';

export type MessageSender = 'paula' | 'echo' | 'user';

export interface BaseMessage {
  id: string;
  sender: MessageSender;
  type: string;
  timestamp: number;
}

export interface TextMessage extends BaseMessage {
  type: 'text';
  text: string;
}

export interface PostMessage extends BaseMessage {
  type: 'post';
  post: {
    name: string;
    handle: string;
    contentKey: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
  };
}

export interface TypingMessage extends BaseMessage {
  type: 'typing';
  typing: boolean;
};

export type Message = TextMessage | PostMessage | TypingMessage;

export interface OnboardingContext {
  messages: Message[];
  selectedOptions: string[];
  typing: boolean;
}

export type OnboardingOptionEvent = {
  type:
    | 'option1-step1'
    | 'option2-step1'
    | 'option3-step1'
    | 'option1-step2'
    | 'option2-step2'
    | 'option3-step2'
    | 'option1-step3'
    | 'option2-step3';
  optionText: string;
};

export type OnboardingEvent =
  | { type: '$$initial' }
  | OnboardingOptionEvent
  | { type: 'AUTO_COMPLETE' };

export interface OnboardingOption {
  id: string;
  translationKey: string;
}

const createTypingMessage = (sender: MessageSender): TypingMessage => ({
  id: `msg-${Date.now()}`,
  sender,
  type: 'typing',
  typing: true,
  timestamp: Date.now(),
});

const createMessage = (sender: MessageSender, text: string): TextMessage => ({
  id: `msg-${Date.now()}`,
  sender,
  type: 'text',
  text,
  timestamp: Date.now(),
});

export const createPostMessage = (
  sender: MessageSender,
  post: PostMessage['post']
): PostMessage => ({
  id: `msg-${Date.now()}`,
  sender,
  type: 'post',
  post,
  timestamp: Date.now(),
});

type EffectArgs = {
  context: OnboardingContext;
  event?: OnboardingEvent;
  setContext: (updater: (context: OnboardingContext) => OnboardingContext) => void;
  send: (event: OnboardingEvent) => void;
};

const appendUserSelection = (
  context: OnboardingContext,
  event: OnboardingOptionEvent
): OnboardingContext => ({
  ...context,
  messages: [...context.messages, createMessage('user', event.optionText)],
  selectedOptions: [...context.selectedOptions, event.type],
});

const getCurrentOptions = (state: string): OnboardingOption[] => {
  switch (state) {
    case 'initial':
      return [
        {
          id: 'option1-step1',
          translationKey: 'step1.option1',
        },
        {
          id: 'option2-step1',
          translationKey: 'step1.option2',
        },
        {
          id: 'option3-step1',
          translationKey: 'step1.option3',
        },
      ];
    case 'step2':
      return [
        {
          id: 'option1-step2',
          translationKey: 'step2.option1',
        },
        {
          id: 'option2-step2',
          translationKey: 'step2.option2',
        },
        {
          id: 'option3-step2',
          translationKey: 'step2.option3',
        },
      ];
    case 'step3':
      return [
        {
          id: 'option1-step3',
          translationKey: 'step3.option1',
        },
        {
          id: 'option2-step3',
          translationKey: 'step3.option2',
        },
      ];
    default:
      return [];
  }
};

export const initialContextValue: OnboardingContext = {
  messages: [createTypingMessage('paula')],
  selectedOptions: [],
  typing: true,
};
export const useOnboardingMachine = (
  initialContext: OnboardingContext = initialContextValue,
  initialState: string = 'initial'
) => {
  const ONBOARDING_TYPING_TIMEOUT = 1000;
  const [state, send] = useStateMachine({
    id: 'onboarding',
    schema: {
      context: t<OnboardingContext>(),
    },
    context: initialContext,
    initial: initialState,
    states: {
      initial: {
        on: {
          'option1-step1': 'completed',
          'option2-step1': 'step2',
          'option3-step1': 'example',
        },
        effect({ setContext, event }: EffectArgs) {
          if (!event || event.type === 'AUTO_COMPLETE') return;
          const timeout = setTimeout(() => {
            setContext((context: OnboardingContext) => {
              return {
                ...context,
                messages: [...context.messages.slice(0, -1), createMessage('paula', 'step1.greeting')],
                typing: false,
              };
            });
          }, ONBOARDING_TYPING_TIMEOUT);
          return () => clearTimeout(timeout);
        },
      },
      step2: {
        on: {
          'option1-step2': 'completed',
          'option2-step2': 'step3',
          'option3-step2': 'example',
        },
        effect({ setContext, event }: EffectArgs) {
          if (!event || event.type === 'AUTO_COMPLETE' || event.type === '$$initial') return;

          setContext((context: OnboardingContext) => {
            const withSelection = appendUserSelection(context, event);

            return {
              ...withSelection,
              messages: [...withSelection.messages, createTypingMessage('paula')],
              typing: true,
            };
          });
          const timeout = setTimeout(() => {
            setContext((context: OnboardingContext) => {
              return {
                ...context,
                messages: [
                  ...context.messages.slice(0, -1),
                  createMessage('paula', 'step2.explanation'),
                  createPostMessage('echo', {
                    name: 'Echo',
                    handle: '@climate_truth_warrior',
                    contentKey: 'echoPost',
                    mediaUrl: '/images/example/echo-post-img.jpg',
                    mediaType: 'image',
                  }),
                ],
                typing: false,
              };
            });
          }, ONBOARDING_TYPING_TIMEOUT);
          return () => clearTimeout(timeout);
        },
      },
      step3: {
        effect({ setContext, event }: EffectArgs) {
          if (!event || event.type === 'AUTO_COMPLETE' || event.type === '$$initial') return;

          setContext((context: OnboardingContext) => {
            const withSelection = appendUserSelection(context, event);

            return {
              ...withSelection,
              messages: [...withSelection.messages, createTypingMessage('paula')],
              typing: true,
            };
          });
          const timeout = setTimeout(() => {
            setContext((context: OnboardingContext) => {
              return {
                ...context,
                messages: [...context.messages.slice(0, -1), createMessage('paula', 'step3.tips')],
                typing: false,
              };
            });
          }, ONBOARDING_TYPING_TIMEOUT);
          return () => clearTimeout(timeout);
        },
        on: {
          'option1-step3': 'completed',
          'option2-step3': 'example',
        },
      },
      example: {
        effect({ setContext, event, send }: EffectArgs) {
          if (!event || event.type === 'AUTO_COMPLETE' || event.type === '$$initial') return;

          setContext((context: OnboardingContext) => {
            const updated = appendUserSelection(context, event);
            return {
              ...updated,
              messages: [
                ...updated.messages,
                createTypingMessage('paula'),
              ],
              typing: true,
            };
          });
          const timeout = setTimeout(() => {
            setContext((context: OnboardingContext) => {
              return {
                ...context,
                messages: [...context.messages.slice(0, -1), 
                  createMessage('paula', 'example.message'),
                ],
                typing: false,
              };
            });
            const timeout2 = setTimeout(() => {
              send({ type: 'AUTO_COMPLETE' });
              clearTimeout(timeout2);
            }, 2000);
          }, ONBOARDING_TYPING_TIMEOUT);
          return () => clearTimeout(timeout);
        },
        on: {
          AUTO_COMPLETE: 'completed',
        },
      },
      completed: {
        type: 'final',
      },
    },
  });

  const currentState = state.value as string;
  const currentOptions = getCurrentOptions(currentState);
  const isCompleted = currentState === 'completed';

  return [
    state,
    send,
    {
      currentOptions,
      isCompleted,
    },
  ] as const;
};

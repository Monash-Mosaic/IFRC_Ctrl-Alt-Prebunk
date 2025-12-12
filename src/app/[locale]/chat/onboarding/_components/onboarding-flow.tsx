"use client";

import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useOnboardingMachine } from "../_machines/onboarding-machine";
import TextMessage from "./text-message";
import OptionButton from "./option-button";
import type { Message, OnboardingOptionEvent } from "../_machines/onboarding-machine";
import PostMessage from "./post-message";
import PaulaAvatar from "../_icons/paula-avatar";
import EchoAvatar from "../_icons/echo-avatar";
import POSTS from "../posts";

const KEY_STATE = "onboardingState";

const getStateFromStore = () => {
  const DEFAULT_STATE = { context: undefined, state: undefined };
  if (typeof window === 'undefined') return DEFAULT_STATE;
  const state = localStorage.getItem(KEY_STATE);
  return state ? JSON.parse(state) : DEFAULT_STATE;
};

const users = {
  "user": {
    name: "You",
    avatar: null,
  },
  "paula": {
    name: "Paula",
    avatar: <PaulaAvatar />,
  },
  "echo": {
    name: "Echo",
    avatar: <EchoAvatar />,
  },
}

export default function OnboardingFlow() {
  const locale = useLocale();
  const t = useTranslations("chat.onboarding");
  const { context, state: initialState } = getStateFromStore();
  const [state, send, { currentOptions, isCompleted }] = useOnboardingMachine(context, initialState);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const post = POSTS[locale];

  useEffect(() => {
    if (isCompleted) localStorage.removeItem(KEY_STATE);
    else localStorage.setItem(KEY_STATE, JSON.stringify({ context: state.context, state: state.value }));
  }, [state, isCompleted]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.context.messages]);

  const handleOptionClick = (optionId: string, translationKey: string) => {
    send({
      type: optionId,
      optionText: translationKey,
    } as OnboardingOptionEvent);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages Container */}
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6">
        {state.context.messages.map((message: Message) => {
          switch (message.type) {
            case "text":
              const sender = users[message.sender as keyof typeof users];
              return (
                <TextMessage
                  key={message.id}
                  isUser={message.sender === "user"}
                  senderName={sender.name}
                  senderAvatar={sender.avatar}
                  displayText={t(message.text)}
                />
              );
            case "post":
              return (
                <PostMessage
                  key={message.id}
                  name={message.post.name}
                  handle={message.post.handle}
                  content={post[message.post.contentKey as keyof typeof post] as React.ReactNode}
                  mediaUrl={message.post.mediaUrl}
                  mediaType={message.post.mediaType}
                />
              );
            default:
              return null;
          }
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Options Container */}
      {!isCompleted && currentOptions.length > 0 && (
        <div className="border-t border-[#E8E9ED] bg-white px-4 py-4">
          <div className="mx-auto flex max-w-2xl flex-col gap-3">
            {currentOptions.map((option) => (
              <OptionButton
                key={option.id}
                id={option.id}
                displayText={t(option.translationKey)}
                onClick={() => handleOptionClick(option.id, option.translationKey)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

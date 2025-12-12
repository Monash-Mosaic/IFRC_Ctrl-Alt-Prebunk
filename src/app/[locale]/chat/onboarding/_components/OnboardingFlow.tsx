"use client";

import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useOnboardingMachine } from "../_machines/onboardingMachine";
import TextMessage from "./TextMessage";
import OptionButton from "./OptionButton";
import type { Message, OnboardingContext, OnboardingOptionEvent } from "../_machines/onboardingMachine";
import PostMessage from "./PostMessage";
import PaulaAvatar from "../_icons/PaulaAvatar";
import EchoAvatar from "../_icons/EchoAvatar";
import POSTS from "../posts";

export default function OnboardingFlow() {
  const locale = useLocale();
  const t = useTranslations("chat.onboarding");
  const [state, send, { currentOptions, isCompleted, hasSelectedOption }] = useOnboardingMachine();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const post = POSTS[locale];

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
              return (
                <TextMessage
                  key={message.id}
                  isUser={message.sender === "user"}
                  senderName={message.sender === "user" ? "You" : message.sender === "paula" ? "Paula" : "Echo"}
                  senderAvatar={message.sender === "paula" ? <PaulaAvatar /> : message.sender === "echo" ? <EchoAvatar /> : undefined}
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
                disabled={hasSelectedOption(option.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

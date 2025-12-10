"use client";

import { useEffect, useRef } from "react";
import { useMachine } from "@xstate/react";
import { useTranslations } from "next-intl";
import { onboardingMachine } from "../_machines/onboardingMachine";
import TextMessage from "./TextMessage";
import OptionButton from "./OptionButton";
import type { BaseMessage, Message } from "../_machines/onboardingMachine";
import PostMessage from "./PostMessage";
import PaulaAvatar from "../_icons/PaulaAvatar";
import EchoAvatar from "../_icons/EchoAvatar";

export default function OnboardingFlow() {
  const t = useTranslations("chat.onboarding");
  const [state, send] = useMachine(onboardingMachine);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.context.messages]);

  // Notify parent of state changes
  useEffect(() => {
    console.log("State changed:", state.value);
  }, [state.value]);

  const handleOptionClick = (optionId: string, translationKey: string) => {
    send({
      type: "SELECT_OPTION",
      optionId,
      optionText: translationKey,
    });
  };

  const getCurrentOptions = () => {
    const currentState = state.value as string;

    switch (currentState) {
      case "initial":
        return [
          {
            id: "option1-step1",
            translationKey: "step1.option1",
            emoji: "🎮",
          },
          {
            id: "option2-step1",
            translationKey: "step1.option2",
            emoji: "🤔",
          },
          {
            id: "option3-step1",
            translationKey: "step1.option3",
            emoji: "🚀",
          },
        ];
      case "step2":
        return [
          {
            id: "option1-step2",
            translationKey: "step2.option1",
            emoji: "",
          },
          {
            id: "option2-step2",
            translationKey: "step2.option2",
            emoji: "",
          },
          {
            id: "option3-step2",
            translationKey: "step2.option3",
            emoji: "",
          },
        ];
      case "step3":
        return [
          {
            id: "option1-step3",
            translationKey: "step3.option1",
            emoji: "",
          },
          {
            id: "option2-step3",
            translationKey: "step3.option2",
            emoji: "",
          },
        ];
      default:
        return [];
    }
  };

  const isCompleted = state.value === "completed";
  const currentOptions = getCurrentOptions();
  const hasSelectedOption = (optionId: string) =>
    state.context.selectedOptions.includes(optionId);

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









'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { content, ContentType, MCQContent } from '@/contents/en';
import { useCredibilityStore } from '@/lib/use-credibility-store';
import ChatHeadline from '../onboarding/_components/chat-headline';
import BotTextMessage from '../onboarding/_components/bot-text-message';
import UserTextMessage from '../onboarding/_components/user-text-message';
import OptionButton from '../onboarding/_components/option-button';
import { CHAT_USERS } from '../_constants/users';

const ALEX_QUESTION = content['mcq-1'];
const CORRECT_ANSWER_POINTS = 5;

function BotRichMessage({
  senderAvatar,
  senderName,
  children,
}: {
  senderAvatar?: React.ReactNode;
  senderName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full justify-start gap-3">
      {senderAvatar && <div className="flex items-end justify-end">{senderAvatar}</div>}
      <div className="w-full flex-col gap-1 md:max-w-[70%]">
        <div className="flex justify-end">
          <div className="flex rounded-r-2xl rounded-tl-2xl border border-[#2979FF] bg-[#2979FF]/10 px-4 py-3 text-black">
            <div className="space-y-3 text-sm leading-relaxed">{children}</div>
          </div>
        </div>
        <span className="text-xs font-medium text-[#2979FF]">{senderName}</span>
      </div>
    </div>
  );
}

export default function AlexChatPage() {
  const t = useTranslations('chat.alex');
  const point = useCredibilityStore((state) => state.point);
  const setPoint = useCredibilityStore((state) => state.setPoint);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const question = ALEX_QUESTION?.type === ContentType.MCQ ? (ALEX_QUESTION as MCQContent) : null;
  const selectedOption = question?.options.find((o) => o.id === selectedOptionId) ?? null;
  const isCorrect = selectedOptionId === question?.correctOptionId;

  const handleOptionClick = (optionId: string) => {
    if (!question || selectedOptionId) return;
    setSelectedOptionId(optionId);
    if (optionId === question.correctOptionId) setPoint(point + CORRECT_ANSWER_POINTS);
  };

  if (!question) return null;

  return (
    <div className="mx-auto flex flex-col md:px-4 md:pt-6">
      <ChatHeadline name={CHAT_USERS.alex.name} />
      <div className="mx-auto flex h-[calc(100vh-10rem)] w-full max-w-md flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6">
          <BotTextMessage
            senderName={CHAT_USERS.alex.name}
            senderAvatar={CHAT_USERS.alex.avatar}
            displayText={t('greeting')}
          />
          <BotRichMessage senderName={CHAT_USERS.alex.name} senderAvatar={CHAT_USERS.alex.avatar}>
            {question.post.content}
          </BotRichMessage>

          {selectedOption && <UserTextMessage displayText={selectedOption.label} />}

          {selectedOption && (
            <>
              <BotTextMessage
                senderName={CHAT_USERS.alex.name}
                senderAvatar={CHAT_USERS.alex.avatar}
                displayText={
                  isCorrect
                    ? t('correctReply', { points: CORRECT_ANSWER_POINTS })
                    : t('incorrectReply')
                }
              />
              <BotRichMessage senderName={CHAT_USERS.alex.name} senderAvatar={CHAT_USERS.alex.avatar}>
                {isCorrect ? question.whyCorrectAnswer.content : question.whyIncorrectAnswer.content}
              </BotRichMessage>
            </>
          )}
        </div>

        {!selectedOption && (
          <div className="border-t border-[#E8E9ED] bg-white px-4 py-4 md:pb-4">
            <div className="mb-3 text-sm font-medium text-[#0D1B3E]">{t('chooseAnswer')}</div>
            <div className="mx-auto flex max-w-2xl flex-col gap-3">
              {question.options.map((option) => (
                <OptionButton
                  key={option.id}
                  id={option.id}
                  displayText={option.label}
                  onClick={() => handleOptionClick(option.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

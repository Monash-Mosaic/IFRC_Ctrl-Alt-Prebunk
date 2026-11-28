'use client';

import type { ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import CONTENTS from '@/contents';
import type { MCQContent } from '@/contents/en';
import PostMessage from '@/components/post-message';
import PlayerAvatar from '@/components/player-avatar';
import { useProfileStore } from '@/lib/use-profile-store';
import { CHAT_USERS } from '../../_constants/users';
import type { Message } from '../_machines/onboarding-machine';
import POSTS from '../_posts';
import BotTextMessage from './bot-text-message';
import TypingMessage from './typing-message';
import UserTextMessage from './user-text-message';

export const practiceItem = CONTENTS.en.practiceContent['example-mcq'] as MCQContent;

interface OnboardingConversationProps {
  messages: ReadonlyArray<Message>;
  practiceAnswer?: string | null;
  finalReply?: string;
  children?: ReactNode;
}

export default function OnboardingConversation({
  messages,
  practiceAnswer,
  finalReply,
  children,
}: OnboardingConversationProps) {
  const locale = useLocale();
  const t = useTranslations('chat.onboarding');
  const profileT = useTranslations('profile');
  const { username, avatarId } = useProfileStore();
  const playerAvatar = (
    <PlayerAvatar avatarId={avatarId} name={username || profileT('defaultUsername')} size={40} />
  );
  const posts = POSTS[locale];
  const answer = practiceItem.options.find((option) => option.id === practiceAnswer);
  const isCorrect = practiceAnswer === practiceItem.correctOptionId;
  const feedback = isCorrect ? practiceItem.whyCorrectAnswer : practiceItem.whyIncorrectAnswer;
  const paula = CHAT_USERS.paula;

  return (
    <>
      {messages.map((message) => {
        const sender = CHAT_USERS[message.sender];
        switch (message.type) {
          case 'text':
            return message.sender === 'user' ? (
              <UserTextMessage
                key={message.id}
                displayText={t(message.text)}
                senderAvatar={playerAvatar}
              />
            ) : (
              <BotTextMessage
                key={message.id}
                senderName={sender.name}
                senderAvatar={sender.avatar}
                displayText={t(
                  message.text === 'practice.explanation' ? 'practice.mcq' : message.text
                )}
              />
            );
          case 'post':
            return (
              <PostMessage
                key={message.id}
                user={sender}
                content={posts[message.post.contentKey as keyof typeof posts] as ReactNode}
                mediaUrl={message.post.mediaUrl}
                mediaType={message.post.mediaType}
              />
            );
          case 'typing':
            return (
              <TypingMessage
                key={message.id}
                senderName={sender.name}
                senderAvatar={sender.avatar}
              />
            );
          default:
            return null;
        }
      })}
      {children}
      {answer && (
        <>
          <UserTextMessage displayText={answer.label} isIncorrect={!isCorrect} />
          <BotTextMessage
            senderName={paula.name}
            senderAvatar={paula.avatar}
            displayText={feedback.title}
          />
          <BotTextMessage
            senderName={paula.name}
            senderAvatar={paula.avatar}
            displayText={feedback.content}
          />
          <BotTextMessage
            senderName={paula.name}
            senderAvatar={paula.avatar}
            displayText={t('handoff')}
          />
        </>
      )}
      {finalReply && <UserTextMessage displayText={t(finalReply)} senderAvatar={playerAvatar} />}
    </>
  );
}

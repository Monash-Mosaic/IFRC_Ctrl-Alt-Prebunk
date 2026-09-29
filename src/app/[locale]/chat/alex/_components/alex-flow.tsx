'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import BotTextMessage from '../../onboarding/_components/bot-text-message';
import UserTextMessage from '../../onboarding/_components/user-text-message';
import OptionButton from '../../onboarding/_components/option-button';
import { CHAT_USERS } from '../../_constants/users';
import { useCredibilityStore } from '@/lib/use-credibility-store';

type Reply = 'right' | 'wrong';

export default function AlexFlow() {
  const t = useTranslations('chat.alex');
  const [reply, setReply] = useState<Reply | null>(null);
  const scored = useRef(false);
  const { addPoints, increaseCredibility, decreaseCredibility } = useCredibilityStore();
  const alex = CHAT_USERS.alex;

  const choose = (next: Reply) => {
    if (reply || scored.current) return;
    scored.current = true;
    setReply(next);
    if (next === 'right') {
      increaseCredibility();
      addPoints(5);
    } else {
      decreaseCredibility();
    }
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6">
        <BotTextMessage
          senderName={alex.name}
          senderAvatar={alex.avatar}
          displayText={t('opening')}
        />
        <UserTextMessage displayText={t('sendAgain')} />
        <BotTextMessage senderName={alex.name} senderAvatar={alex.avatar} displayText={t('link')} />
        <BotTextMessage
          senderName={alex.name}
          senderAvatar={alex.avatar}
          displayText={t('askOpinion')}
        />
        {reply && (
          <>
            <UserTextMessage displayText={t(reply === 'right' ? 'replyRight' : 'replyWrong')} />
            <BotTextMessage
              senderName={alex.name}
              senderAvatar={alex.avatar}
              displayText={t(reply === 'right' ? 'correctTitle' : 'wrongTitle')}
            />
            <BotTextMessage
              senderName={alex.name}
              senderAvatar={alex.avatar}
              displayText={t(reply === 'right' ? 'correctBody' : 'wrongBody')}
            />
          </>
        )}
      </div>
      {!reply && (
        <div className="border-t border-[#E8E9ED] bg-white px-4 py-4 md:pb-4">
          <div className="mx-auto flex max-w-2xl flex-col gap-3">
            <OptionButton
              id="alex-reply-wrong"
              displayText={t('replyWrong')}
              onClick={() => choose('wrong')}
            />
            <OptionButton
              id="alex-reply-right"
              displayText={t('replyRight')}
              onClick={() => choose('right')}
            />
          </div>
        </div>
      )}
    </div>
  );
}

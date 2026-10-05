'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import BotTextMessage from '../../onboarding/_components/bot-text-message';
import UserTextMessage from '../../onboarding/_components/user-text-message';
import TypingMessage from '../../onboarding/_components/typing-message';
import OptionButton from '../../onboarding/_components/option-button';
import { CHAT_USERS } from '../../_constants/users';
import { useCredibilityStore } from '@/lib/use-credibility-store';
import PrebunkingModal from '@/components/newfeeds/prebunking-modal';
import { type AlexReply } from '@/lib/local-storage';
import { useAlexChat } from '@/lib/use-alex-chat';
import { useRouter } from '@/i18n/routing';

const TYPING_MS = 1000;

function formatSentAt(date: Date) {
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const suffix = date.getHours() >= 12 ? 'PM' : 'AM';
  const hours = date.getHours() % 12 || 12;
  return `${hours}:${minutes}${suffix}`;
}

export default function AlexFlow() {
  const t = useTranslations('chat.alex');
  const router = useRouter();
  const [alexChat, setAlexChat, ready] = useAlexChat();
  const reply = alexChat.reply;
  const scored = useRef(false);
  const [justReplied, setJustReplied] = useState(false);
  const [introStep, setIntroStep] = useState(0);
  const [outcomeReady, setOutcomeReady] = useState(false);
  const [wrongPopupOpen, setWrongPopupOpen] = useState(false);
  const [sentAt, setSentAt] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const { addPoints, increaseCredibility, decreaseCredibility } = useCredibilityStore();
  const alex = CHAT_USERS.alex;

  useEffect(() => {
    if (!ready || reply) return;
    // typing, opening, player's line, typing, link, typing, question
    const delays = [1000, 1600, 2200, 3200, 3800, 4800];
    const timers = delays.map((ms, index) => setTimeout(() => setIntroStep(index + 1), ms));
    return () => timers.forEach(clearTimeout);
  }, [ready, reply]);

  useEffect(() => {
    if (!ready || reply !== 'right' || !justReplied) return;
    const timer = setTimeout(() => setOutcomeReady(true), TYPING_MS);
    return () => clearTimeout(timer);
  }, [ready, reply, justReplied]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [introStep, outcomeReady, reply]);

  const choose = (next: AlexReply) => {
    if (reply || scored.current) return;
    scored.current = true;
    setJustReplied(true);
    setAlexChat({ notified: true, reply: next });
    if (next === 'right') {
      increaseCredibility();
      addPoints(5);
    } else {
      decreaseCredibility();
      setWrongPopupOpen(true);
    }
  };

  const seenBefore = reply !== null && !justReplied;
  const showOpening = introStep >= 1 || reply !== null;
  const showSendAgain = introStep >= 2 || reply !== null;
  const showLinkTyping = introStep === 3 && !reply;
  const showLink = introStep >= 4 || reply !== null;
  const showAskTyping = introStep === 5 && !reply;
  const showAsk = introStep >= 6 || reply !== null;
  const showRightOutcome = reply === 'right' && (seenBefore || outcomeReady);
  const showBack =
    showRightOutcome || (reply === 'wrong' && !wrongPopupOpen && (seenBefore || justReplied));

  if (showSendAgain && sentAt === null) {
    setSentAt(formatSentAt(new Date()));
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6">
        {(introStep === 0 || !ready) && !reply && (
          <TypingMessage senderName={alex.name} senderAvatar={alex.avatar} />
        )}
        {showOpening && (
          <BotTextMessage
            senderName={alex.name}
            senderAvatar={alex.avatar}
            displayText={t('opening')}
          />
        )}
        {showSendAgain && (
          <UserTextMessage
            displayText={t('sendAgain')}
            sentAt={showLink ? (sentAt ?? undefined) : undefined}
          />
        )}
        {showLinkTyping && <TypingMessage senderName={alex.name} senderAvatar={alex.avatar} />}
        {showLink && (
          <BotTextMessage
            senderName={alex.name}
            senderAvatar={alex.avatar}
            displayText={t('link')}
            reaction
          />
        )}
        {showAskTyping && <TypingMessage senderName={alex.name} senderAvatar={alex.avatar} />}
        {showAsk && (
          <BotTextMessage
            senderName={alex.name}
            senderAvatar={alex.avatar}
            displayText={t('askOpinion')}
          />
        )}
        {reply && (
          <UserTextMessage displayText={t(reply === 'right' ? 'replyRight' : 'replyWrong')} />
        )}
        {reply === 'right' && justReplied && !outcomeReady && (
          <TypingMessage senderName={alex.name} senderAvatar={alex.avatar} />
        )}
        {showRightOutcome && (
          <>
            <BotTextMessage
              senderName={alex.name}
              senderAvatar={alex.avatar}
              displayText={t('correctTitle')}
            />
            <BotTextMessage
              senderName={alex.name}
              senderAvatar={alex.avatar}
              displayText={t('correctBody')}
            />
          </>
        )}
        <div ref={endRef} />
      </div>
      {((ready && !reply && introStep >= 6) || showBack) && (
        <div className="border-t border-[#E8E9ED] bg-white px-4 py-4 md:pb-4">
          <div className="mx-auto flex max-w-2xl flex-col gap-3">
            {ready && !reply && introStep >= 6 && (
              <>
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
              </>
            )}
            {showBack && (
              <OptionButton id="alex-back" displayText={t('back')} onClick={() => router.replace('/')} />
            )}
          </div>
        </div>
      )}
      <PrebunkingModal
        isOpen={wrongPopupOpen}
        onClose={() => setWrongPopupOpen(false)}
        postId="alex"
        header={<h1 className="text-xl font-bold">{t('wrongTitle')}</h1>}
        content={<p>{t('wrongBody')}</p>}
        isCorrect={false}
      />
    </div>
  );
}

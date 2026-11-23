'use client';

import { ArrowDown, BadgeCheck, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CHAT_USERS } from '@/app/[locale]/chat/_constants/users';
import PostMessage from '@/components/post-message';
import type { ShareContent } from '@/contents/en';
import { cn } from '@/lib/utils';

interface ShareQuestionPostProps {
  question: ShareContent;
  answer: string | null;
  disabled: boolean;
  onAnswer: (postId: string, answer: string) => void;
}

export default function ShareQuestionPost({
  question,
  answer,
  disabled,
  onAnswer,
}: ShareQuestionPostProps) {
  const t = useTranslations('shareQuestion');
  const choices = [
    { id: 'share', label: t('share'), Icon: Send },
    { id: 'skip', label: t('skip'), Icon: ArrowDown },
  ];

  return (
    <PostMessage
      {...question.post}
      interaction={
        <section aria-label={t('prompt')} className="space-y-3">
          <p className="text-sm font-semibold text-[#011E41]">{t('prompt')}</p>
          <div className="grid grid-cols-2 gap-2">
            {choices.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                aria-haspopup="dialog"
                aria-pressed={answer === id}
                disabled={disabled || answer !== null}
                className={cn(
                  'flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#011E41] px-2 text-sm font-semibold text-[#011E41] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#011E41] enabled:hover:bg-slate-100 disabled:cursor-default',
                  answer === id && (id === question.correctAnswer ? 'bg-green-100' : 'bg-red-100')
                )}
                onClick={() => onAnswer(question.id, id)}
              >
                <Icon size={17} aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </section>
      }
    />
  );
}

/**
 * Shows a sample verified account in the Share question feedback to help players recognise
 * verification cues when checking a source.
 */
function VerificationBadge() {
  const t = useTranslations('shareQuestion');

  return (
    <figure className="space-y-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
      <figcaption className="text-xs font-semibold text-slate-700">{t('badgeExample')}</figcaption>
      <div className="flex items-center gap-1.5 font-semibold">
        <span>{t('exampleAccount')}</span>
        <BadgeCheck
          role="img"
          aria-label={t('verifiedBadge')}
          size={17}
          className="shrink-0 text-blue-700"
        />
      </div>
      <p className="break-all text-xs text-slate-600">{t('exampleHandle')}</p>
    </figure>
  );
}

export function ShareQuestionFeedback({
  question,
  shared,
  explanation,
}: {
  question: ShareContent;
  shared: boolean;
  explanation: ShareContent['whyCorrectAnswer']['content'];
}) {
  const t = useTranslations('shareQuestion');
  const { name: friend, avatar } = CHAT_USERS.alex;
  const sharedPost = t('sharedPost', { friend });

  return (
    <>
      {shared && (
        <section aria-label={sharedPost} className="space-y-1 text-sm">
          <p className="font-medium text-slate-700">{sharedPost}</p>
          <PostMessage
            user={question.post.user}
            content={question.post.content}
            className="my-0 bg-slate-50 p-3 shadow-none"
          />
        </section>
      )}
      <div className="space-y-1">
        {shared && (
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[#011E41]">
            <span className="size-8 shrink-0 [&>svg]:size-full" aria-hidden="true">
              {avatar}
            </span>
            {t('friendReplied', { friend })}
          </h2>
        )}
        {explanation}
      </div>
      <VerificationBadge />
    </>
  );
}

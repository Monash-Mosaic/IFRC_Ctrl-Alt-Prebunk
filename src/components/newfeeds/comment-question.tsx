'use client';

import { useEffect, useId, useRef } from 'react';
import Image from 'next/image';
import Modal from 'react-modal';
import { ArrowLeft, MessagesSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';
import PostMessage from '@/components/post-message';
import type { CommentContent } from '@/contents/en';
import { cn } from '@/lib/utils';

export function CommentQuestionPost({
  question,
  answered,
  disabled,
  onOpen,
}: {
  question: CommentContent;
  answered: boolean;
  disabled: boolean;
  onOpen: () => void;
}) {
  const t = useTranslations('commentQuestion');
  const hintId = useId();

  return (
    <PostMessage
      {...question.post}
      className="border-0 bg-[#E4EAF3] shadow-none"
      interaction={
        <div className="space-y-1">
          <button
            type="button"
            aria-haspopup="dialog"
            aria-describedby={answered ? undefined : hintId}
            disabled={disabled}
            className="-ms-2.5 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md bg-transparent px-2.5 py-1.5 text-sm font-semibold text-[#011E41] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#011E41] enabled:hover:bg-[#011E41]/5 enabled:active:bg-[#011E41]/10 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={onOpen}
          >
            <MessagesSquare size={20} className="shrink-0" aria-hidden="true" />
            {t('comments')}
          </button>
          {!answered && (
            <p id={hintId} className="text-xs leading-relaxed text-slate-700">
              {t('readAndReply')}
            </p>
          )}
        </div>
      }
    />
  );
}

interface CommentQuestionDialogProps {
  question: CommentContent;
  answer: string | null;
  onAnswer: (postId: string, answer: string) => void;
  onClose: () => void;
  onContinue: () => void;
}

export function CommentQuestionDialog({
  question,
  answer,
  onAnswer,
  onClose,
  onContinue,
}: CommentQuestionDialogProps) {
  const t = useTranslations('commentQuestion');
  const prebunking = useTranslations('prebunking');
  const feedbackRef = useRef<HTMLElement>(null);
  const reply = question.options.find((option) => option.id === answer);
  const isCorrect = answer === question.correctOptionId;
  const feedback = isCorrect ? question.whyCorrectAnswer : question.whyIncorrectAnswer;

  useEffect(() => {
    if (answer) feedbackRef.current?.focus();
  }, [answer]);

  return (
    <Modal
      isOpen
      onRequestClose={onClose}
      contentLabel={t('comments')}
      overlayClassName="fixed inset-0 z-[100] bg-[#011E41]/25 max-md:grid max-md:grid-rows-[minmax(0,1fr)] max-md:place-items-center max-md:px-4 max-md:pt-28 max-md:pb-20 lg:bg-transparent"
      className="z-[100] mx-auto flex max-h-full w-full flex-col overflow-hidden rounded-2xl bg-white outline-none max-md:shadow-xl md:fixed md:inset-x-0 md:bottom-4 md:top-28 md:max-w-md lg:inset-x-auto lg:bottom-auto lg:start-[calc(50vw+3.5rem)] lg:max-h-[calc(100dvh-8rem)] lg:w-[22rem] lg:bg-[#E4EAF3]"
    >
      <header className="flex shrink-0 items-center gap-2 px-4 py-2 text-[#011E41] max-lg:border-b max-lg:border-slate-200 lg:justify-between lg:px-5 lg:pt-3">
        <button
          type="button"
          aria-label={t('close')}
          onClick={onClose}
          className="grid size-11 shrink-0 place-items-center rounded-lg hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-[#011E41] lg:order-last lg:hover:bg-white/70"
        >
          <ArrowLeft size={22} aria-hidden="true" />
        </button>
        <h2 className="text-lg font-bold lg:text-2xl">{t('comments')}</h2>
      </header>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 pb-5 pt-4 text-sm text-[#011E41] lg:pt-0">
        <article className="flex gap-2 lg:me-6 lg:items-end">
          <span className="mt-0.5 size-7 shrink-0 lg:mb-0.5 [&>svg]:size-full" aria-hidden="true">
            {question.comment.author.avatar}
          </span>
          <div className="lg:rounded-2xl lg:rounded-bl-sm lg:border lg:border-blue-500 lg:bg-blue-500/10 lg:px-3 lg:py-2">
            <h3 className="font-semibold text-blue-700">{question.comment.author.name}</h3>
            <p className="mt-1">{question.comment.text}</p>
          </div>
        </article>
        {reply ? (
          <div className="ms-7 space-y-3 border-s border-slate-200 ps-3 lg:ms-0 lg:border-0 lg:ps-0">
            <article className="flex gap-2 lg:ms-6 lg:flex-row-reverse lg:items-end">
              <Image
                src="/images/example/player-comment-avatar.webp"
                alt=""
                width={28}
                height={28}
                className="mt-0.5 size-7 shrink-0 rounded-full lg:mb-0.5"
              />
              <div className="lg:rounded-2xl lg:rounded-br-sm lg:border lg:border-dashed lg:border-emerald-600 lg:bg-emerald-50 lg:px-3 lg:py-2">
                <h3 className="font-semibold">{t('yourReply')}</h3>
                <p className="mt-1">{reply.label}</p>
              </div>
            </article>
            <article
              ref={feedbackRef}
              tabIndex={-1}
              className="min-w-0 space-y-1 focus:outline-hidden lg:me-6 lg:ms-9"
            >
              <blockquote className="truncate border-s-2 border-slate-400 ps-2 text-xs text-slate-700">
                {reply.label}
              </blockquote>
              <div
                className={cn(
                  'space-y-1 rounded-lg border px-3 py-2 lg:rounded-2xl lg:rounded-bl-sm',
                  isCorrect ? 'border-emerald-600 bg-emerald-50' : 'border-rose-600 bg-rose-50'
                )}
              >
                <h3 className="font-semibold">{t('feedback')}</h3>
                <div className="font-semibold">{feedback.title}</div>
                <div>{feedback.content}</div>
              </div>
            </article>
            <button
              type="button"
              onClick={onContinue}
              className="min-h-11 w-full rounded-lg bg-[#011E41] px-4 font-semibold text-white hover:bg-[#002A5A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#011E41]"
            >
              {prebunking('continueButton')}
            </button>
          </div>
        ) : (
          <section aria-label={t('prompt')} className="space-y-2 lg:ms-6">
            <h3 className="font-semibold">{t('prompt')}</h3>
            {question.options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onAnswer(question.id, option.id)}
                className="min-h-11 w-full rounded-xl border border-[#011E41] bg-white px-3 py-2 text-start hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#011E41] lg:rounded-2xl lg:rounded-br-sm"
              >
                {option.label}
              </button>
            ))}
          </section>
        )}
      </div>
    </Modal>
  );
}

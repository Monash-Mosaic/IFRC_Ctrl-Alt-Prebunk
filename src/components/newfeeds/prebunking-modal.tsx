'use client';

import React from 'react';
import Modal from 'react-modal';
import { useTranslations } from 'next-intl';
import { CornerUpLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PrebunkingModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  content: React.ReactNode; // Compiled React content for the modal body
  header: React.ReactNode; // Header content for the modal
  /** Correct answer → dunder green header; incorrect → dunder red */
  isCorrect: boolean;
}

export default function PrebunkingModal({
  isOpen,
  onClose,
  postId,
  content,
  header,
  isCorrect,
}: PrebunkingModalProps) {
  const t = useTranslations('prebunking');

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none"
      overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      contentLabel={t('modalLabel')}
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
    >
      <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl" data-post-id={postId}>
        <div
          className={cn(
            'px-6 py-4 flex items-center gap-3',
            isCorrect ? 'bg-(--color-dunder-green)' : 'bg-(--color-dunder-red)'
          )}
          data-result={isCorrect ? 'correct' : 'incorrect'}
        >
          <div className="shrink-0" aria-hidden="true">
            <CornerUpLeft
              className={cn(
                isCorrect ? 'text-[color:var(--light-black,#000)]' : 'text-white'
              )}
              size={24}
              strokeWidth={2.5}
            />
          </div>
          <div
            className={cn(
              isCorrect ? 'text-[color:var(--light-black,#000)]' : 'text-white'
            )}
          >
            {header}
          </div>
        </div>

        {/* White Body Section */}
        <div className="bg-white px-6 py-5 space-y-4">
          <div className="space-y-4 [&_a]:!text-(--color-dunder-red) [&_a:hover]:opacity-80">
            {content}
          </div>

          {/* Continue Button */}
          <div className="pt-4">
            <button
              onClick={onClose}
              className={cn(
                'w-full rounded-lg bg-[#011E41] text-white font-semibold py-3 px-4',
                'transition-colors hover:bg-[#002A5A] active:bg-[#001A3F]',
                'focus:outline-none focus:ring-2 focus:ring-[#011E41] focus:ring-offset-2'
              )}
              aria-label={t('continueButton')}
            >
              {t('continueButton')}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

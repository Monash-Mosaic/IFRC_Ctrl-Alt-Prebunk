'use client';

import { useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';
import { useTranslations } from 'next-intl';
import { Check, Copy, X } from 'lucide-react';

const CONTACT_EMAIL = 'solferino.academy@ifrc.org';
const COPIED_RESET_MS = 2000;

interface ContactUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CopyStatus = 'idle' | 'copied' | 'failed';

export default function ContactUsModal({ isOpen, onClose }: ContactUsModalProps) {
  const t = useTranslations('contact');
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    Modal.setAppElement(document.getElementById('root') || document.body);
    return () => clearTimeout(resetTimer.current);
  }, []);

  const handleClose = () => {
    clearTimeout(resetTimer.current);
    setCopyStatus('idle');
    onClose();
  };

  const handleCopy = async () => {
    clearTimeout(resetTimer.current);
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopyStatus('copied');
      resetTimer.current = setTimeout(() => setCopyStatus('idle'), COPIED_RESET_MS);
    } catch {
      setCopyStatus('failed');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      className="fixed inset-0 z-100 flex items-start justify-center overflow-y-auto p-2 pt-20 pb-24 outline-none sm:items-center sm:px-4 sm:py-4"
      overlayClassName="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
      contentLabel={t('title')}
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
    >
      <div className="relative w-full max-w-lg rounded-[1.5rem] bg-white p-4 shadow-2xl sm:rounded-[2rem] sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-[#011E41]">{t('title')}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">{t('description')}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label={t('close')}
            className="rounded-full p-2 text-slate-700 transition hover:bg-slate-100"
          >
            <X size={20} aria-hidden />
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-3 rounded-lg border border-[#E8E9ED] p-3 sm:flex-row sm:items-center sm:justify-between">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="break-all text-base font-medium text-(--color-ifrc-blue) underline-offset-2 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          <button
            type="button"
            onClick={handleCopy}
            className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-(--color-ifrc-red) px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            {copyStatus === 'copied' ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
            {copyStatus === 'copied' ? t('copied') : t('copy')}
          </button>
        </div>

        <p role="status" className="mt-2 min-h-5 text-sm text-slate-600">
          {copyStatus === 'copied' && <span className="sr-only">{t('copied')}</span>}
          {copyStatus === 'failed' && t('copyFailed')}
        </p>
      </div>
    </Modal>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';
import { useTranslations } from 'next-intl';
import { Check, Copy, X } from 'lucide-react';

const CONTACT_EMAIL = 'solferino.academy@ifrc.org';

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
      resetTimer.current = setTimeout(() => setCopyStatus('idle'), 2000);
    } catch {
      setCopyStatus('failed');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      className="my-auto w-full max-w-lg rounded-3xl bg-white p-5 shadow-2xl outline-none sm:p-6"
      overlayClassName="fixed inset-0 z-[100] flex justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
      contentLabel={t('title')}
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl leading-6 font-semibold text-(--color-ifrc-blue)">{t('title')}</h2>
        <button
          type="button"
          onClick={handleClose}
          aria-label={t('close')}
          className="-me-2.5 flex size-11 shrink-0 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100"
        >
          <X size={20} aria-hidden />
        </button>
      </div>

      <div className="mt-1 text-sm leading-6 text-slate-600">
        <p>{t('description')}</p>
        <p className="max-sm:whitespace-pre-line">{t('instruction')}</p>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-base font-medium wrap-anywhere text-(--color-ifrc-blue) underline-offset-2 hover:underline"
        >
          {CONTACT_EMAIL}
        </a>
        <button
          type="button"
          onClick={handleCopy}
          className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-(--color-ifrc-red) px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          {copyStatus === 'copied' ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
          {copyStatus === 'copied' ? t('copied') : t('copy')}
        </button>
      </div>

      <p role="status" className={copyStatus === 'failed' ? 'mt-2 text-sm text-slate-600' : 'sr-only'}>
        {copyStatus === 'copied' && t('copied')}
        {copyStatus === 'failed' && t('copyFailed')}
      </p>
    </Modal>
  );
}

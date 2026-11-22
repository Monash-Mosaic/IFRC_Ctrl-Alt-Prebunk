'use client';

import { type FormEvent, useEffect, useId, useState } from 'react';
import Modal from 'react-modal';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';

interface ContactUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CONTACT_MESSAGE_MAX_LENGTH = 500;

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

const EMPTY_FORM = { email: '', name: '', country: '', message: '' };

const inputClassName =
  'w-full rounded-lg border border-[#E8E9ED] px-3 py-2 text-sm text-[#011E41] focus:border-(--color-ifrc-blue) focus:outline-none focus:ring-2 focus:ring-(--color-ifrc-blue)/30';
const labelClassName = 'mb-1 block text-sm font-medium text-[#011E41]';

export default function ContactUsModal({ isOpen, onClose }: ContactUsModalProps) {
  const t = useTranslations('contact');
  const id = useId();
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState<SubmitStatus>('idle');

  useEffect(() => {
    Modal.setAppElement(document.getElementById('root') || document.body);
  }, []);

  const handleChange = (field: keyof typeof EMPTY_FORM) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (status !== 'submitting') setStatus('idle');
  };

  const handleClose = () => {
    if (status === 'success') setForm(EMPTY_FORM);
    setStatus('idle');
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.message.length > CONTACT_MESSAGE_MAX_LENGTH) return;

    setStatus('submitting');
    //Placeholder send workflow. Will be updated once email sending option is confirmed
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          name: form.name.trim(),
          country: form.country.trim(),
          message: form.message.trim(),
        }),
      });
      if (!response.ok) throw new Error(`Contact request failed: ${response.status}`);
      setForm(EMPTY_FORM);
      setStatus('success');
    } catch {
      setStatus('error');
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
      <div className="relative w-full max-w-lg max-h-[calc(100vh-7rem)] overflow-y-auto rounded-[1.5rem] bg-white p-4 shadow-2xl sm:max-h-none sm:rounded-[2rem] sm:p-6">
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

        {status === 'success' ? (
          <p role="status" className="mt-6 rounded-lg bg-[#00FF9C]/10 p-4 text-sm text-[#011E41]">
            {t('success')}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
            <div>
              <label htmlFor={`${id}-email`} className={labelClassName}>
                {t('email')}
              </label>
              <input
                id={`${id}-email`}
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => handleChange('email')(e.target.value)}
                className={inputClassName}
              />
            </div>
            <div>
              <label htmlFor={`${id}-name`} className={labelClassName}>
                {t('name')}
              </label>
              <input
                id={`${id}-name`}
                type="text"
                required
                autoComplete="name"
                value={form.name}
                onChange={(e) => handleChange('name')(e.target.value)}
                className={inputClassName}
              />
            </div>
            <div>
              <label htmlFor={`${id}-country`} className={labelClassName}>
                {t('country')}
              </label>
              <input
                id={`${id}-country`}
                type="text"
                required
                autoComplete="country-name"
                value={form.country}
                onChange={(e) => handleChange('country')(e.target.value)}
                className={inputClassName}
              />
            </div>
            <div>
              <label htmlFor={`${id}-message`} className={labelClassName}>
                {t('message')}
              </label>
              <textarea
                id={`${id}-message`}
                required
                rows={5}
                maxLength={CONTACT_MESSAGE_MAX_LENGTH}
                aria-describedby={`${id}-message-count`}
                value={form.message}
                onChange={(e) => handleChange('message')(e.target.value)}
                className={`${inputClassName} resize-none`}
              />
              <p id={`${id}-message-count`} className="mt-1 text-right text-xs text-slate-500">
                {t('characterCount', {
                  count: form.message.length,
                  max: CONTACT_MESSAGE_MAX_LENGTH,
                })}
              </p>
            </div>

            {status === 'error' && (
              <p role="alert" className="text-sm text-[#FF1E56]">
                {t('error')}
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="rounded-full bg-(--color-ifrc-red) px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === 'submitting' ? t('submitting') : t('submit')}
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
}

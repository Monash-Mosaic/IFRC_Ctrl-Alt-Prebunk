'use client';

import { useEffect } from 'react';
import Modal from 'react-modal';
import { useTranslations } from 'next-intl';
import { ArrowUpLeft, Menu, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PrebunkingModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  technique?: string;
  explanation?: string;
  dataLink?: string;
  dataLinkText?: string;
}

export default function PrebunkingModal({
  isOpen,
  onClose,
  postId,
  technique = 'Cherry-Picking',
  explanation,
  dataLink,
  dataLinkText,
}: PrebunkingModalProps) {
  const t = useTranslations('prebunking');

  useEffect(() => {
    // Set app element for react-modal accessibility
    if (typeof window !== 'undefined') {
      const rootElement = document.getElementById('root') || document.body;
      Modal.setAppElement(rootElement);
    }
  }, []);

  const handleContinue = () => {
    onClose();
  };

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
        {/* Red Header Section */}
        <div className="bg-[#E63946] px-6 py-4 flex items-center gap-3">
          <div className="shrink-0" aria-hidden="true">
            <ArrowUpLeft className="text-white" size={24} strokeWidth={2.5} />
          </div>
          <div className="text-white">
            <div className="text-lg font-semibold">{t('header.holdOn')}</div>
            <div className="text-sm">{t('header.misleading')}</div>
          </div>
        </div>

        {/* White Body Section */}
        <div className="bg-white px-6 py-5 space-y-4">
          <div>
            <p className="text-[#0D1B3E] text-base leading-relaxed">
              {t('body.techniquePrefix')} <strong className="font-semibold">{technique}</strong>
            </p>
          </div>

          {explanation && (
            <div className="flex items-start gap-3">
              <Menu className="text-[#6B7280] mt-1 shrink-0" size={20} strokeWidth={2} aria-hidden="true" />
              <p className="text-[#0D1B3E] text-sm leading-relaxed">{explanation}</p>
            </div>
          )}

          <div className="flex items-start gap-3">
            <ArrowRight className="text-[#6B7280] mt-1 shrink-0" size={20} strokeWidth={2} aria-hidden="true" />
            <p className="text-[#0D1B3E] text-sm leading-relaxed">{t('body.context')}</p>
          </div>

          {dataLink && (
            <div className="pt-2">
              <a
                href={dataLink}
                target="_blank"
                rel="no-referrer noopener"
                className="text-[#E63946] underline font-semibold text-sm hover:text-[#C02D3A] transition-colors"
                aria-label={dataLinkText ? `${dataLinkText} (opens in new tab)` : `${t('body.dataLink')} (opens in new tab)`}
              >
                {dataLinkText || t('body.dataLink')}
              </a>
            </div>
          )}

          {/* Continue Button */}
          <div className="pt-4">
            <button
              onClick={handleContinue}
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

'use client';

import Modal from 'react-modal';
import ShareProgress from '@/components/share-progress';

interface ShareProgressModalProps {
    isOpen: boolean;
    onClose: () => void;
    correctAnswers: number;
    totalQuestions: number;
}

export default function ShareProgressModal({
    isOpen,
    onClose,
    correctAnswers,
    totalQuestions
}: ShareProgressModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-2 pt-20 pb-24 outline-none sm:items-center sm:px-4 sm:py-4"
            overlayClassName="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            contentLabel="Share your progress"
            shouldCloseOnOverlayClick={true}
            shouldCloseOnEsc={true}
        >
            <div className="relative w-full max-w-lg max-h-[calc(100vh-7rem)] overflow-y-auto rounded-[1.5rem] bg-white p-4 shadow-2xl sm:max-h-none sm:rounded-[2rem] sm:p-6">
                <div className="flex flex-col gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold text-slate-900">Share your progress</h2>
                        <p className="mt-1 text-sm leading-6 text-slate-600">Share or download a snapshot of your results.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="mx-auto w-full rounded-full border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 sm:mx-0 sm:w-auto"
                    >
                        Close
                    </button>
                </div>

                <div className="mt-5 flex justify-center">
                    <ShareProgress
                        correctAnswers={correctAnswers}
                        totalQuestions={totalQuestions}
                    />
                </div>
            </div>
        </Modal>
    );
}

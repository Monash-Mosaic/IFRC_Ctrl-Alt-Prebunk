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
            className="fixed inset-0 z-50 flex items-center justify-center mt-10 p-3 outline-none sm:p-4"
            overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm"
            contentLabel="Share your progress"
            shouldCloseOnOverlayClick={true}
            shouldCloseOnEsc={true}
        >
            <div className="relative w-full max-w-lg rounded-[2rem] bg-white p-4 shadow-2xl sm:p-6">
                <div className="flex flex-col gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold text-slate-900">Share your progress</h2>
                        <p className="mt-1 text-sm text-slate-600">Download a snapshot of your results to share.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="mx-auto rounded-full border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 sm:mx-0"
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

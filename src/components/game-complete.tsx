'use client';

import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import PhotoCreditsModal from '@/components/photo-credits-modal';
import ShareProgressModal from '@/components/share-progress-modal';
import { getSimulationOutcome } from '@/lib/simulation-outcome';
import { useCredibilityStore } from '@/lib/use-credibility-store';

export { OUTCOME_LABELS, OUTCOME_MESSAGES } from '@/lib/simulation-outcome';

interface GameCompleteProps {
  correctAnswers: number;
  totalQuestions: number;
  restartGame: () => void;
}

export default function GameComplete({
  correctAnswers,
  totalQuestions,
  restartGame,
}: GameCompleteProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPhotoCreditsOpen, setIsPhotoCreditsOpen] = useState(false);
  const credibility = useCredibilityStore((state) => state.credibility);
  const maxCredibility = useCredibilityStore((state) => Math.max(state.initialCredibility, 1));
  const outcome = getSimulationOutcome(correctAnswers, totalQuestions);

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof Modal.setAppElement === 'function') {
      Modal.setAppElement(document.getElementById('root') ?? document.body);
    }
  }, []);

  return (
    <div className="text-center">
      <p className={`text-3xl text-[#2979FF] pb-3`}>Simulation complete!</p>
      <div className="w-full max-w-sm rounded-3xl bg-[#E4EAF3] px-6 py-8 text-center shadow-sm">
        <p className="mx-auto max-w-xs text-[15px] leading-7 text-slate-700">{outcome.message}</p>

        <div className="mt-8">
          <p className={`text-5xl font-black tracking-[0.2em] text-[#2979FF]`}>
            {correctAnswers}/{totalQuestions}
          </p>

          <p
            className={`mt-4 text-3xl font-black uppercase leading-tight tracking-[0.25em] text-[#2979FF]`}
          >
            {outcome.label}
          </p>
        </div>

        <div className="mx-auto mt-6 max-w-xs text-sm font-semibold text-[#011E41]">
          <div className="flex justify-between gap-2">
            <span>Final credibility</span>
            <span>{credibility}/{maxCredibility}</span>
          </div>
          <meter
            aria-label="Final credibility"
            min={0}
            max={maxCredibility}
            value={credibility}
            optimum={maxCredibility}
            className="mt-2 block h-2.5 w-full overflow-hidden rounded-full bg-white [&::-moz-meter-bar]:rounded-full [&::-moz-meter-bar]:bg-[#23D99A] [&::-webkit-meter-bar]:rounded-full [&::-webkit-meter-bar]:border-0 [&::-webkit-meter-bar]:bg-white [&::-webkit-meter-optimum-value]:rounded-full [&::-webkit-meter-optimum-value]:bg-[#23D99A]"
          />
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <a
            href="https://wdr26.org/en"
            target="_blank"
            rel="noreferrer"
            className="btn rounded-full border border-dashed border-slate-500 bg-white/40 px-6 py-4 text-base font-medium text-slate-800 transition hover:bg-white"
          >
            Read the World Disasters Report
          </a>

          <a
            href="https://solferinoacademy.com/"
            target="_blank"
            rel="noreferrer"
            className="btn rounded-full border border-dashed border-slate-500 bg-white/40 px-6 py-4 text-base font-medium text-slate-800 transition hover:bg-white"
          >
            Learn about Solferino Academy
          </a>

          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="rounded-full border border-dashed border-slate-500 bg-white/40 px-6 py-4 text-base font-medium text-slate-800 transition hover:bg-white"
          >
            Share my progress
          </button>

          <button
            type="button"
            onClick={restartGame}
            className="rounded-full bg-[#011E41] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#002552]"
          >
            Restart simulation
          </button>
        </div>
      </div>

      <p className="mt-3 max-w-sm px-4 text-xs leading-relaxed text-slate-600">
        Illustrations adapted from{' '}
        <a
          href="https://www.openpeeps.com/"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 hover:text-[#011E41]"
        >
          Open Peeps
        </a>{' '}
        by Pablo Stanley
      </p>

      <div className="max-w-sm">
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => setIsPhotoCreditsOpen(true)}
          className="min-h-11 cursor-pointer px-3 text-xs text-slate-600 underline underline-offset-2 hover:text-[#011E41] focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Photo credits
        </button>
      </div>
      <PhotoCreditsModal isOpen={isPhotoCreditsOpen} onClose={() => setIsPhotoCreditsOpen(false)} />
      <ShareProgressModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        correctAnswers={correctAnswers}
        totalQuestions={totalQuestions}
      />
    </div>
  );
}

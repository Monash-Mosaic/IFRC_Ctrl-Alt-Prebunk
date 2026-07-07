'use client';

export interface SimulationResultProps {
  correctAnswers: number;
  totalQuestions: number;
  onRestart: () => void;
}

const OUTCOME_LABELS = [
  'Prebunking Emerging',
  'Prebunking Beginner',
  'Prebunking Novice',
  'Prebunker',
  'Prebunking Proficient',
  'Prebunking Champion',
] as const;

const OUTCOME_MESSAGES = [
  'You are starting to spot misinformation patterns. Try the simulation again and look closely at the explanation after each post.',
  'You caught some warning signs. Keep practising so misleading posts feel easier to question before sharing.',
  'You are building stronger prebunking instincts. Review the missed explanations and aim one level higher next time.',
  'You can recognise several common misinformation tactics. A little more practice will make your judgement sharper.',
  'You are close to expert level. You spotted most misleading patterns and are ready to help others slow down before sharing.',
  'You are ready to help stop disinformation in the real world. Check out this article on misinformation on the IFRC Solferino Academy website.',
] as const;

function getOutcomeIndex(correctAnswers: number, totalQuestions: number) {
  if (totalQuestions <= 0) return 0;

  const percentage = (correctAnswers / totalQuestions) * 100;
  return Math.min(5, Math.max(0, Math.round(percentage / 20)));
}

export function getSimulationOutcome(correctAnswers: number, totalQuestions: number) {
  const outcomeIndex = getOutcomeIndex(correctAnswers, totalQuestions);

  return {
    label: OUTCOME_LABELS[outcomeIndex],
    message: OUTCOME_MESSAGES[outcomeIndex],
  };
}

export default function SimulationResult({
  correctAnswers,
  totalQuestions,
  onRestart,
}: SimulationResultProps) {
  const outcome = getSimulationOutcome(correctAnswers, totalQuestions);

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-var(--spacing)*34)] w-full max-w-sm flex-col items-center justify-center px-4 py-8 text-center">
      <h1 className="mb-3 text-2xl font-semibold text-[#4F8CF7]">
        Simulation complete!
      </h1>

      <div className="w-full rounded-2xl bg-[#EEF3F7] px-6 py-7 shadow-sm">
        <p className="mx-auto max-w-[260px] text-sm font-medium leading-6 text-[#38445A]">
          {outcome.message}
        </p>

        <div className="mt-6 text-5xl font-extrabold leading-none tracking-normal text-[#3F82F6]">
          {correctAnswers} / {totalQuestions}
        </div>

        <div className="mx-auto mt-4 inline-block max-w-full break-words bg-[#B9D8FF] px-2 py-1 font-mono text-xl font-bold uppercase leading-tight tracking-[0.12em] text-[#3F82F6]">
          {outcome.label}
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <a
            href="https://www.ifrc.org/world-disasters-report"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-dashed border-[#718096] bg-white px-5 py-3 text-sm font-semibold text-[#38445A] transition-colors hover:bg-[#F7FAFC]"
          >
            Read the World Disasters Report
          </a>
          <a
            href="https://solferinoacademy.com/"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-dashed border-[#718096] bg-white px-5 py-3 text-sm font-semibold text-[#38445A] transition-colors hover:bg-[#F7FAFC]"
          >
            Learn about Solferino Academy
          </a>
          <button
            type="button"
            onClick={onRestart}
            className="rounded-full bg-[#002B5C] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#001E40]"
          >
            Restart simulation
          </button>
        </div>
      </div>
    </section>
  );
}

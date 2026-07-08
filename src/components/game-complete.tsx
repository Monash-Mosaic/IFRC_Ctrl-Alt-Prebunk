'use client';

interface GameCompleteProps {
    correctAnswers: number;
    totalQuestions: number;
    restartGame: () => void;
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

export default function GameComplete({ correctAnswers, totalQuestions, restartGame }: GameCompleteProps) {
    const outcome = getSimulationOutcome(correctAnswers, totalQuestions);

    return (
        <div className="text-center">
            <p className={`text-3xl text-[#2979FF] pb-3`}>
                Simulation complete!
            </p>
            <div className="w-full max-w-sm rounded-3xl bg-[#E4EAF3] px-6 py-8 text-center shadow-sm">
                <p className="mx-auto max-w-xs text-[15px] leading-7 text-slate-700">
                    {outcome.message}
                </p>

                <div className="mt-8">
                    <p className={`text-5xl font-black tracking-[0.2em] text-[#2979FF]`}>
                        {correctAnswers}/{totalQuestions}
                    </p>

                    <p className={`mt-4 text-3xl font-black uppercase leading-tight tracking-[0.25em] text-[#2979FF]`}>
                        {outcome.label}
                    </p>
                </div>

                <div className="mt-10 flex flex-col gap-4">
                    <a href="https://wdr26.org/en" target="_blank" className="btn rounded-full border border-dashed border-slate-500 bg-white/40 px-6 py-4 text-base font-medium text-slate-800 transition hover:bg-white">
                        Read the World Disasters Report
                    </a>

                    <a href="https://solferinoacademy.com/" target="_blank" className="btn rounded-full border border-dashed border-slate-500 bg-white/40 px-6 py-4 text-base font-medium text-slate-800 transition hover:bg-white">
                        Learn about Solferino Academy
                    </a>

                    {/* Implement Later */}
                    {/* <button onClick={} className="rounded-full border border-dashed border-slate-500 bg-white/40 px-6 py-4 text-base font-medium text-slate-800 transition hover:bg-white">
                        Share my progress
                    </button> */}

                    <button onClick={restartGame} className="rounded-full bg-[#011E41] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#002552]">
                        Restart simulation
                    </button>
                </div>
            </div>
        </div>
    );
}
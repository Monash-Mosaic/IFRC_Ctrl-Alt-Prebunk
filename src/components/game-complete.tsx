'use client';

interface GameCompleteProps {
    correctAnswers: number;
    totalQuestions: number;
}

export default function GameComplete({ correctAnswers, totalQuestions }: GameCompleteProps) {
    return (
        <div className="w-full max-w-sm rounded-3xl bg-[#E4EAF3] px-6 py-8 text-center shadow-sm">
            <p className="mx-auto max-w-xs text-[15px] leading-7 text-slate-700">
                You are ready to help stop disinformation in the real world.
                Check out this article on misinformation on the Solferino
                Academy website.
            </p>

            <div className="mt-8">
                <p className={`text-5xl font-black tracking-[0.2em] text-[#2979FF]`}>
                    {correctAnswers}/{totalQuestions}
                </p>

                <p className={`mt-4 text-3xl font-black uppercase leading-tight tracking-[0.25em] text-[#2979FF]`}>
                    Prebunking Champion
                </p>
            </div>

            <div className="mt-10 flex flex-col gap-4">
                <a href="https://wdr26.org/en" target="_blank" className="btn rounded-full border border-dashed border-slate-500 bg-white/40 px-6 py-4 text-base font-medium text-slate-800 transition hover:bg-white">
                    Read the World Disasters Report
                </a>

                <a href="https://solferinoacademy.com/" target="_blank" className="btn rounded-full border border-dashed border-slate-500 bg-white/40 px-6 py-4 text-base font-medium text-slate-800 transition hover:bg-white">
                    Learn about Solferino Academy
                </a>

                <button className="rounded-full border border-dashed border-slate-500 bg-white/40 px-6 py-4 text-base font-medium text-slate-800 transition hover:bg-white">
                    Share my progress
                </button>

                <button className="rounded-full bg-[#011E41] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#002552]">
                    Restart simulation
                </button>
            </div>
        </div>
    );
}
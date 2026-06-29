'use client';

import React, { useCallback, useRef } from 'react';

import Title from '@/components/title';

interface ShareProgressProps {
    correctAnswers: number;
    totalQuestions: number;
}

export default function ShareProgress({ correctAnswers, totalQuestions }: ShareProgressProps) {
    const ref = useRef<HTMLDivElement>(null);

    const handleDownload = useCallback(async () => {
        if (ref.current === null) return;

        const { toPng } = await import('html-to-image');
        await toPng(ref.current, { cacheBust: true, pixelRatio: 2 })
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.download = 'prebunk-results.png';
                link.href = dataUrl;
                link.click();
            })
            .catch((err) => {
                console.error(err);
            });
    }, []);

    return (
        <div className="flex w-full max-w-[420px] flex-col items-center gap-4">
            <div
                ref={ref}
                className="w-full rounded-[1.75rem] border border-slate-200 bg-[#E4EAF3] px-4 py-6 text-center shadow-sm sm:px-6 sm:py-8"
                style={{ minHeight: '240px' }}
            >
                <div className="mx-auto flex max-w-[320px] flex-col items-center justify-center">
                    <Title width={'115%'} height={'115%'}/>
                    <p className="mt-3 text-[15px] leading-7 text-slate-700">
                        You are ready to help stop disinformation in the real world. Dive deeper into the data that matters.
                    </p>

                    <div className="mt-6">
                        <p className="text-5xl font-black tracking-[0.2em] text-[#2979FF]">
                            {correctAnswers}/{totalQuestions}
                        </p>

                        <p className="mt-3 text-2xl font-black uppercase leading-tight tracking-[0.2em] text-[#2979FF] sm:text-3xl">
                            Prebunking Champion
                        </p>
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={handleDownload}
                className="w-full max-w-[280px] rounded-full bg-[#011E41] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#002552]"
            >
                Download Image
            </button>
        </div>
    );
}
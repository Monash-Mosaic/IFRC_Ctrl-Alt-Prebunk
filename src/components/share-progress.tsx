'use client';

import React, { useCallback, useRef } from 'react';
// import { toPng, toBlob } from 'html-to-image';

import Title from '@/components/title';
import { GAME_URL } from '@/lib/share-links';
import { getSimulationOutcome } from '@/lib/simulation-outcome';

export type ShareProgressResult = 'shared' | 'downloaded' | 'cancelled' | 'failed';

interface ShareProgressProps {
    correctAnswers: number;
    totalQuestions: number;
    /** Optional: notified how a share/download attempt ended, e.g. to show feedback. */
    onResult?: (result: ShareProgressResult) => void;
}

export default function ShareProgress({ correctAnswers, totalQuestions, onResult }: ShareProgressProps) {
    const ref = useRef<HTMLDivElement>(null);
    const outcomeLabel = getSimulationOutcome(correctAnswers, totalQuestions).label;

    const handleDownload = useCallback(async () => {
        if (ref.current === null) return;

        const { toPng } = await import('html-to-image');

        await toPng(ref.current, { cacheBust: true, pixelRatio: 2 })
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.download = 'prebunk-results.png';
                link.href = dataUrl;
                link.click();
                onResult?.('downloaded');
            })
            .catch(() => {
                console.error('Error generating image');
                onResult?.('failed');
            });
    }, [onResult]);

    const handleShare = useCallback(async () => {
        if (ref.current === null) return;

        try {
            const { toBlob } = await import('html-to-image');
            const blob = await toBlob(ref.current, { cacheBust: true, pixelRatio: 2 });

            if (!blob) {
                console.error("Failed to generate image blob");
                onResult?.('failed');
                return;
            }
            
            const file = new File([blob], 'prebunk-results.png', { type: 'image/png' });

            if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
                const shareData = {
                    title: outcomeLabel,
                    text: `I scored ${correctAnswers}/${totalQuestions} in the IFRC prebunking challenge. Play at ${GAME_URL}`,
                    files: [file],
                };

                if (typeof navigator.canShare === 'function' && !navigator.canShare(shareData)) {
                    await handleDownload();
                    return;
                }

                await navigator.share(shareData);
                onResult?.('shared');
                return;
            }

            await handleDownload();
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                onResult?.('cancelled');
                return;
            }
            console.error('Error sharing image:', err instanceof Error ? err.name : 'unknown error');
            await handleDownload();
        }
    }, [correctAnswers, handleDownload, onResult, outcomeLabel, totalQuestions]);

    return (
        <div className="flex w-full max-w-[420px] flex-col items-center gap-3 sm:gap-4">
            <div
                ref={ref}
                className="w-full rounded-[1.5rem] border border-slate-200 bg-[#E4EAF3] px-3 py-5 text-center shadow-sm sm:rounded-[1.75rem] sm:px-6 sm:py-8"
                style={{ minHeight: '220px' }}
            >
                <div className="mx-auto flex max-w-[320px] flex-col items-center justify-center">
                    <Title width={'100%'} height={'100%'}/>
                    <p className="mt-2 text-sm leading-6 text-slate-700 sm:mt-3 sm:text-[15px] sm:leading-7">
                        You are ready to help stop disinformation in the real world. Dive deeper into the data that matters.
                    </p>

                    <div className="mt-4 sm:mt-6">
                        <p className="text-4xl font-black tracking-[0.2em] text-[#2979FF] sm:text-5xl">
                            {correctAnswers}/{totalQuestions}
                        </p>

                        <p className="mt-2 text-xl font-black uppercase leading-tight tracking-[0.2em] text-[#2979FF] sm:mt-3 sm:text-2xl sm:text-3xl">
                            {outcomeLabel}
                        </p>
                    </div>

                    <p className="mt-4 text-xs font-medium text-slate-500 sm:mt-5 sm:text-sm">
                        Play at {GAME_URL}
                    </p>
                </div>
            </div>

            <div className="flex w-full max-w-[280px] flex-col gap-2 sm:flex-row sm:gap-3">
                <button
                    type="button"
                    onClick={handleShare}
                    className="flex-1 rounded-full border border-[#011E41] px-4 py-2.5 text-base font-semibold text-[#011E41] transition hover:bg-slate-100 sm:px-6 sm:py-3"
                >
                    Share
                </button>
                <button
                    type="button"
                    onClick={handleDownload}
                    className="flex-1 rounded-full bg-[#011E41] px-4 py-2.5 text-base font-semibold text-white transition hover:bg-[#002552] sm:px-6 sm:py-3"
                >
                    Download
                </button>
            </div>
        </div>
    );
}
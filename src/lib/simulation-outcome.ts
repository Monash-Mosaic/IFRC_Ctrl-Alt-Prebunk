export const OUTCOME_LABELS = [
    'Prebunking Emerging',
    'Prebunking Beginner',
    'Prebunking Novice',
    'Prebunker',
    'Prebunking Proficient',
    'Prebunking Champion',
] as const;

export const OUTCOME_MESSAGES = [
    'You are starting to spot misinformation patterns. Try the simulation again and look closely at the explanation after each post.',
    'You caught some warning signs. Keep practising so misleading posts feel easier to question before sharing.',
    'You are building stronger prebunking instincts. Review the missed explanations and aim one level higher next time.',
    'You can recognise several common misinformation tactics. A little more practice will make your judgement sharper.',
    'You are close to expert level. You spotted most misleading patterns and are ready to help others slow down before sharing.',
    'You are ready to help stop disinformation in the real world. Check out the IFRC Solferino Academy website.',
] as const;

function getOutcomeIndex(correctAnswers: number, totalQuestions: number) {
    if (totalQuestions <= 0) return 0;

    const percentage = (correctAnswers / totalQuestions) * 100;
    return Math.min(5, Math.floor(percentage / 20));
}

/** The completion tier for a result; shared by the completion screen and progress sharing. */
export function getSimulationOutcome(correctAnswers: number, totalQuestions: number) {
    const outcomeIndex = getOutcomeIndex(correctAnswers, totalQuestions);

    return {
        label: OUTCOME_LABELS[outcomeIndex],
        message: OUTCOME_MESSAGES[outcomeIndex],
    };
}

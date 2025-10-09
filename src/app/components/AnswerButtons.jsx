'use client'

import { useRouter } from 'next/navigation'

export default function AnswerButtons({ options = ['TRUE', 'FALSE'], correctAnswer, whyCorrect, whyIncorrect }) {
  const router = useRouter()

  const onAnswer = (choice) => {
    const isCorrect = choice === correctAnswer
    let state
    try { state = JSON.parse(localStorage.getItem('debunk:state') || 'null') } catch { state = null }
    if (!state) return router.replace('/')

    const delta = isCorrect ? 10 : -1
    const nextLives = isCorrect ? state.lives : Math.max(0, (state.lives || 0) - 1)
    const next = {
      ...state,
      score: Math.max(0, (state.score || 0) + delta),
      lives: nextLives,
      lastStatus: isCorrect ? 'correct' : 'incorrect',
      lastExplain: isCorrect ? (whyCorrect || '') : (whyIncorrect || ''),
      // advance to next question; cap at max so result screen can detect completion
      current: Math.min((state.current || 0) + 1, state.max || (state.order?.length || 0))
    }
    localStorage.setItem('debunk:state', JSON.stringify(next))
    if (nextLives === 0) {
      router.push('/game-over')
    } else {
      router.push('/quiz/result')
    }
  }

  return (
    <div className="quiz-actions">
      {options.map((option, idx) => (
        <button
          key={`${idx}-${option}`}
          className={`btn btn-answer`}
          aria-label={`Answer ${option}`}
          onClick={() => onAnswer(option)}
        >
          {option}
        </button>
      ))}
    </div>
  )
}



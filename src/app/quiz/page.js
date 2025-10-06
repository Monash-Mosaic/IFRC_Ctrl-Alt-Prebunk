"use client"
import { loadQuestions } from '../../lib/questions.server'
import AnswerButtons from '../components/AnswerButtons.jsx'
import { useEffect, useState } from 'react'
import BackGuard from '../components/BackGuard.jsx'
import { AnimatedDiv } from '../components/animated/AnimatedDiv'
import { Typewriter } from '../components/animated/typewriter'

export default function QuizPage() {
  const questions = loadQuestions()
  const [state, setState] = useState(null)
  const [q, setQ] = useState(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('debunk:state')
      const s = raw ? JSON.parse(raw) : null
      if (!s) return
      setState(s)
      const order = Array.isArray(s.order) && s.order.length ? s.order : [0]
      const current = Number.isInteger(s.current) ? s.current : 0
      const safeCurrent = Math.max(0, Math.min((s.max || order.length) - 1, current))
      const idx = order[safeCurrent] ?? order[0] ?? 0
      fetch(`/api/question/${idx}`, { cache: 'no-store' })
        .then(r => r.json())
        .then(data => setQ(data))
        .catch(() => setQ({ question: questions[idx]?.question, correctAnswer: questions[idx]?.correctAnswer }))
    } catch {}
  }, [])

  if (!state || !q) return null

  const { order, current, score, lives, max } = state
  const total = max
  const idx = order[current] ?? 0
  return (
    <main className="quiz-screen">
      <BackGuard />
      <div className="quiz-wrap">
        <div className="topbar">
          <Typewriter className="left lives" text={`LIVES ${'♥ '.repeat(lives).trim()}`}></Typewriter>
          <Typewriter className="right score" text={`SCORE ${Number(score).toLocaleString()}`}></Typewriter>
        </div>
      </div>

      <div className="center">
        <div className="quiz-body">
          <AnimatedDiv direction='left'>
            <h2 className="quiz-title">QUESTION {current + 1}</h2>
          </AnimatedDiv>

          <AnimatedDiv direction='right'>
                    <div className="prompt text-plain">{q.question}</div>
          </AnimatedDiv>


        <AnswerButtons correctAnswer={q.correctAnswer} whyCorrect={q.whyCorrect} whyIncorrect={q.whyIncorrect} />

        </div>
      </div>

      <div className="quiz-footer">
        <div className="subtle">QUESTION {current + 1} OF {total}</div>
        </div>
    </main>
  );
}



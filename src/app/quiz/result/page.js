"use client"

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import BackGuard from '../../components/BackGuard.jsx'
import { useState } from 'react'

function escapeHtml(input) {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function markdownToHtml(md) {
  const escaped = escapeHtml(md || '')
  // basic markdown: links [text](url), bold **text**, italics *text*, inline code `code`
  const withCode = escaped.replace(/`([^`]+)`/g, '<code>$1</code>')
  const withBold = withCode.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  const withItalics = withBold.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
  const withLinks = withItalics.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
  // auto-link bare URLs
  const withAutoLinks = withLinks.replace(/(^|\s)(https?:\/\/[^\s<]+)(?=$|\s)/g, '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>')
  return withAutoLinks
}

function getResultConfig(status, lives) {
  const isCorrect = status === 'correct'
  const isGameOver = lives === 0
  
  if (isGameOver) {
    return {
      isCorrect: false,
      badgeText: '💀',
      title: 'GAME OVER!',
      sub: 'Out of lives',
      explainTitle: 'Why is this incorrect?',
      badgeClass: 'result-badge bad',
      explainClass: 'result-explain bad'
    }
  }
  
  return {
    isCorrect,
    badgeText: isCorrect ? '+10' : '-1',
    title: isCorrect ? 'CORRECT!' : 'UH OH!',
    sub: isCorrect ? 'Stroke of genius' : 'Bamboozled',
    explainTitle: isCorrect ? 'Why is this correct?' : 'Why is this incorrect?',
    badgeClass: isCorrect ? 'result-badge' : 'result-badge bad',
    explainClass: isCorrect ? 'result-explain' : 'result-explain bad'
  }
}

function ResultContent() {
  const router = useRouter()
  const sp = useSearchParams() // kept for backward-compat, ignored for state
  const raw = sp.get('status') || ''
  let statusFromUrl = raw === 'correct' ? 'correct' : raw === 'incorrect' ? 'incorrect' : null

  function LifeIcon({ index }) {
    const [src, setSrc] = useState('/lives.png')
    if (src === null) return <span style={{ marginRight: 4 }}>♥</span>
    return (
      <img
        src={src}
        alt="life"
        width={16}
        height={16}
        style={{ marginRight: 4, verticalAlign: 'text-bottom' }}
        onError={() => setSrc(prev => (prev === '/lives.png' ? '/lives-bar1 (1).png' : null))}
      />
    )
  }

  // Load state
  let state
  try {
    state = JSON.parse(localStorage.getItem('debunk:state') || 'null')
  } catch { state = null }
  if (!state) {
    router.replace('/')
    return null
  }
  if (state.lives === 0) {
    router.replace('/game-over')
    return null
  }

  const { order, current, score, lives, max } = state
  const total = max

  // Determine correctness if not provided via URL (primary path)
  const status = statusFromUrl || state.lastStatus || 'incorrect'
  const cfg = getResultConfig(status, lives)

  // Show score/lives from state

  return (
    <main className="quiz-screen">
      <BackGuard />
      <div className="topbar">
        <div className="left">LIVES {Array.from({ length: lives }).map((_, i) => (
          <LifeIcon key={i} index={i} />
        ))}</div>
        <div className="right score">SCORE {score.toLocaleString()}</div>
      </div>

      <div className="center">
        <div className="result-wrap">
          <div className={cfg.badgeClass}>{cfg.badgeText}</div>
          <div className="result-title">{cfg.title}</div>
          <div className="result-sub text-plain">{cfg.sub}</div>

          <section className={cfg.explainClass} aria-labelledby="why">
            <h2 id="why" className="text-plain">{cfg.explainTitle}</h2>
            <div className="text-plain" dangerouslySetInnerHTML={{ __html: markdownToHtml(state.lastExplain || 'Explanation unavailable.') }} />
          </section>
        </div>
      </div>

      {lives === 0 ? (
        <Link aria-label="Game over - restart" className="fab-next" href="/" onClick={() => localStorage.removeItem('debunk:state')}>↻</Link>
      ) : current >= total ? (
        <Link aria-label="Complete quiz" className="fab-next" href="/quiz/complete">›</Link>
      ) : (
        <Link aria-label="Next question" className="fab-next" href="/quiz">›</Link>
      )}
    </main>
  )
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="quiz-screen">Loading...</div>}>
      <ResultContent />
    </Suspense>
  )
}




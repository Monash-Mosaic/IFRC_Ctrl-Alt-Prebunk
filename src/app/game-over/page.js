"use client"

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function GameOverPage() {
  const [score, setScore] = useState(0)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem('debunk:state') || 'null')
      if (s && typeof s.score === 'number') setScore(s.score)
    } catch {}
  }, [])

  const onPlayAgain = () => {
    localStorage.removeItem('debunk:state')
  }

  const onShare = async () => {
    try {
      const url = typeof window !== 'undefined' ? window.location.origin : ''
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  return (
    <main className="quiz-screen">
      <div className="topbar">
        <div className="left">LIVES</div>
        <div className="right score">SCORE {Number(score).toLocaleString()}</div>
      </div>

      <div className="center">
        <div className="result-wrap" style={{ textAlign: 'center' }}>
          <Image src="/paula_lose.svg" alt="Sad face" width={184} height={265} />
          <div className="result-title" style={{ marginTop: 24 }}>OH NO!</div>
          <div className="result-sub" style={{ fontFamily: 'inherit', letterSpacing: '0.25ch' }}>YOU'VE FAILED!</div>

          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
            <Link
              href="/"
              aria-label="Play again"
              className="btn btn-filled"
              onClick={onPlayAgain}
              style={{ width: 320, textAlign: 'center', textDecoration: 'none', letterSpacing: '0.2ch', display: 'block', margin: '0 auto' }}
            >
              PLAY AGAIN!
            </Link>

            <button
              aria-label="Share this game"
              className="btn btn-filled"
              onClick={onShare}
              style={{ width: 320, textAlign: 'center', textDecoration: 'none', letterSpacing: '0.2ch', fontFamily: 'inherit', whiteSpace: 'nowrap', display: 'block', margin: '0 auto' }}
            >
              SHARE THIS GAME
            </button>

            {copied ? (
              <div className="subtle" style={{ marginTop: 4 }}>Link copied to clipboard!</div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Restart FAB removed on game-over page */}
    </main>
  )
}



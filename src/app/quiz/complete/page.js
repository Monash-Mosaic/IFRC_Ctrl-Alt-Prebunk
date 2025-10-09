"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import BackGuard from '../../components/BackGuard.jsx'

export default function CompletePage() {
  const router = useRouter()
  const [state, setState] = useState(null)
  const [showCopied, setShowCopied] = useState(false)

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

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem('debunk:state') || 'null')
      if (!s) {
        router.replace('/')
        return
      }
      setState(s)
    } catch {
      router.replace('/')
    }
  }, [router])

  const handleShare = async () => {
    try {
      const url = window.location.origin
      await navigator.clipboard.writeText(url)
      setShowCopied(true)
      setTimeout(() => setShowCopied(false), 1500)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (!state) return null

  const { score, lives } = state

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
        <div className="result-wrap" style={{ textAlign: 'center' }}>
          <div className="result-title" style={{ marginTop: 24, fontSize: 'clamp(18px, 3vw, 28px)' }}>YOUR SCORE</div>
          <div className="result-badge" style={{ margin: '20px auto', background: '#CDF2F2', color: '#0b2540' }}>
            {score}
          </div>
          <div className="result-title" style={{ marginTop: 24 }}>WOOHOO!</div>
          <div className="result-sub" style={{ fontFamily: 'inherit', letterSpacing: '0.25ch', marginTop: 16 }}>YOU'RE A MISINFORMATION FIGHTER!</div>

          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' }}>
            <Link 
              href="/" 
              className="btn btn-filled"
              onClick={() => localStorage.removeItem('debunk:state')}
              style={{ width: 320, textAlign: 'center', textDecoration: 'none', letterSpacing: '0.2ch', display: 'block', margin: '0 auto' }}
            >
              PLAY AGAIN!
            </Link>
            <button 
              className="btn btn-filled"
              onClick={handleShare}
              style={{ width: 320, textAlign: 'center', textDecoration: 'none', letterSpacing: '0.2ch', fontFamily: 'inherit', whiteSpace: 'nowrap', display: 'block', margin: '0 auto' }}
            >
              SHARE THIS GAME
            </button>

            {showCopied ? (
              <div className="subtle" style={{ marginTop: 4 }}>Link copied to clipboard!</div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  )
}



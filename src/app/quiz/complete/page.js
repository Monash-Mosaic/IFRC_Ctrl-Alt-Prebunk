"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import BackGuard from '../../components/BackGuard.jsx'

export default function CompletePage() {
  const router = useRouter()
  const [state, setState] = useState(null)
  const [showCopied, setShowCopied] = useState(false)

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
      setTimeout(() => setShowCopied(false), 3000)
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
        <div className="left">LIVES {'♥ '.repeat(lives).trim()}</div>
        <div className="right score">SCORE {score.toLocaleString()}</div>
      </div>

      <div className="center">
        <div className="completion-wrap">
          <h1 className="completion-title">WOOHOO!</h1>
          <p className="completion-sub text-plain">YOU'RE A MISINFORMATION FIGHTER!</p>

          <div className="completion-buttons">
            <Link 
              href="/" 
              className="btn btn-filled completion-btn"
              onClick={() => localStorage.removeItem('debunk:state')}
            >
              PLAY AGAIN!
            </Link>
            <button 
              className="btn btn-filled completion-btn"
              onClick={handleShare}
            >
              SHARE THIS GAME
            </button>
          </div>

          {showCopied && (
            <div className="copied-message">LINK COPIED TO CLIPBOARD!</div>
          )}
        </div>
      </div>
    </main>
  )
}


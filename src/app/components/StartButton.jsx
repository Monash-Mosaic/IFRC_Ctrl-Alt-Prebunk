'use client'

import { useRouter } from 'next/navigation'
import { AnimatedButton } from './animated/AnimatedButton'

export default function StartButton() {
  const router = useRouter()



  const onStart = async () => {
    const res = await fetch('/api/new-game', { cache: 'no-store' })
    const data = await res.json()
    const order = Array.isArray(data.order) && data.order.length ? data.order : [0]
    const state = { order, current: 0, score: 0, lives: 3, max: data.max || order.length }
    localStorage.setItem('debunk:state', JSON.stringify(state))
    router.push('/welcome')
  }

  return (
    <AnimatedButton className="btn btn-filled" onClick={onStart} direction='left'>
      START
    </AnimatedButton>
  )
}



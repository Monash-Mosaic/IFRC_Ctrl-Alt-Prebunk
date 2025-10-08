export const dynamic = 'force-dynamic'
export const revalidate = 0
import { NextResponse } from 'next/server'
import { loadQuestions } from '../../../lib/questions.server'



export function GET() {
  const all = loadQuestions()
  const order = Array.from({ length: all.length }, (_, i) => i)
  const gameQuestions = order.map(i => all[i])
  return NextResponse.json({ order, questions: gameQuestions, max: all.length })
}



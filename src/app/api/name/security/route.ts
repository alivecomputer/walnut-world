import { NextRequest, NextResponse } from 'next/server'
import { setSecurityQuestion } from '@/lib/names'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const { name, pin, question, answer } = body ?? {}

  if (!name || !pin || !question || !answer) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const result = await setSecurityQuestion(name, pin, question, answer)

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result)
}

import { NextRequest, NextResponse } from 'next/server'
import { reserveName } from '@/lib/names'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const name = body?.name
  if (!name) {
    return NextResponse.json({ error: 'Missing name' }, { status: 400 })
  }

  // Use IP + user-agent hash as holder ID (no auth needed)
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  const ua = req.headers.get('user-agent') ?? ''
  const holderId = `${ip}:${ua.slice(0, 20)}`

  const result = await reserveName(name, holderId)

  if (!result.ok) {
    return NextResponse.json(result, { status: 409 })
  }

  return NextResponse.json(result)
}

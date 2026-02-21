import { NextRequest, NextResponse } from 'next/server'
import { reserveName } from '@/lib/names'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const { name, pin, invitedBy } = body ?? {}

  if (!name) return NextResponse.json({ error: 'Missing name' }, { status: 400 })
  if (!pin || pin.length !== 4) return NextResponse.json({ error: 'PIN must be 4 digits' }, { status: 400 })

  const result = await reserveName(name, pin, invitedBy)

  if (!result.ok) {
    return NextResponse.json(result, { status: 409 })
  }

  return NextResponse.json(result)
}

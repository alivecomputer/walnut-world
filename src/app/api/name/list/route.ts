import { NextResponse } from 'next/server'
import { getReservedNames, getReservedCount } from '@/lib/names'

export async function GET() {
  const names = await getReservedNames()
  const count = await getReservedCount()
  return NextResponse.json({ names, count })
}

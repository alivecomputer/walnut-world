import { NextRequest, NextResponse } from 'next/server'
import { checkName, getReservedCount } from '@/lib/names'

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name')
  if (!name) {
    return NextResponse.json({ error: 'Missing name parameter' }, { status: 400 })
  }

  const result = await checkName(name)
  const count = await getReservedCount()
  return NextResponse.json({ ...result, totalReserved: count })
}

import { kv } from '@vercel/kv'

/**
 * Link reservation system for walnut.world
 *
 * KV structure:
 *   link:{name}:pin          → hashed PIN (permanent)
 *   link:{name}:reserved_at  → ISO timestamp
 *   link:{name}:security_q   → security question (optional)
 *   link:{name}:security_a   → hashed answer (optional)
 *   link:{name}:invited_by   → referrer name
 *   link:{name}:invite_count → number of people invited
 *   links:all                → sorted set of all reserved names (score = timestamp)
 *   links:count              → total reserved count
 */

const FOUNDING_NAMES = ['ben', 'attila', 'will', 'stuart', 'clara', 'leon']

function hashValue(val: string): string {
  let h = 0
  for (let i = 0; i < val.length; i++) {
    h = val.charCodeAt(i) + ((h << 5) - h)
  }
  return Math.abs(h).toString(36)
}

export function cleanName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 20)
}

export type NameStatus =
  | { status: 'taken' }
  | { status: 'reserved' }
  | { status: 'available' }

export async function checkName(name: string): Promise<NameStatus> {
  const clean = cleanName(name)
  if (!clean) return { status: 'taken' }
  if (FOUNDING_NAMES.includes(clean)) return { status: 'taken' }

  const pin = await kv.get<string>(`link:${clean}:pin`)
  if (pin) return { status: 'reserved' }

  return { status: 'available' }
}

export interface ReserveResult {
  ok: boolean
  error?: string
  count?: number
}

export async function reserveName(
  name: string,
  pin: string,
  invitedBy?: string
): Promise<ReserveResult> {
  const clean = cleanName(name)
  if (!clean) return { ok: false, error: 'Invalid name' }
  if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    return { ok: false, error: 'PIN must be 4 digits' }
  }
  if (FOUNDING_NAMES.includes(clean)) return { ok: false, error: 'Link is taken' }

  // Check if already reserved
  const existing = await kv.get<string>(`link:${clean}:pin`)
  if (existing) return { ok: false, error: 'Link is already reserved' }

  const hashed = hashValue(pin)
  const now = new Date().toISOString()

  // Reserve permanently (no TTL)
  await kv.set(`link:${clean}:pin`, hashed)
  await kv.set(`link:${clean}:reserved_at`, now)

  // Add to the global set + increment count
  await kv.zadd('links:all', { score: Date.now(), member: clean })
  const count = await kv.incr('links:count')

  // Track invite referral
  if (invitedBy) {
    const cleanRef = cleanName(invitedBy)
    if (cleanRef && cleanRef !== clean) {
      await kv.set(`link:${clean}:invited_by`, cleanRef)
      await kv.incr(`link:${cleanRef}:invite_count`)
    }
  }

  return { ok: true, count }
}

export async function setSecurityQuestion(
  name: string,
  pin: string,
  question: string,
  answer: string
): Promise<{ ok: boolean; error?: string }> {
  const clean = cleanName(name)
  if (!clean) return { ok: false, error: 'Invalid name' }

  // Verify PIN
  const storedPin = await kv.get<string>(`link:${clean}:pin`)
  if (!storedPin || storedPin !== hashValue(pin)) {
    return { ok: false, error: 'Wrong PIN' }
  }

  await kv.set(`link:${clean}:security_q`, question)
  await kv.set(`link:${clean}:security_a`, hashValue(answer.toLowerCase().trim()))

  return { ok: true }
}

export async function getReservedCount(): Promise<number> {
  const count = await kv.get<number>('links:count')
  return (count ?? 0) + FOUNDING_NAMES.length
}

export async function getReservedNames(): Promise<string[]> {
  const names = await kv.zrange('links:all', 0, -1) as string[]
  return [...FOUNDING_NAMES, ...names]
}

export async function getInviteCount(name: string): Promise<number> {
  const clean = cleanName(name)
  if (!clean) return 0
  const count = await kv.get<number>(`link:${clean}:invite_count`)
  return count ?? 0
}

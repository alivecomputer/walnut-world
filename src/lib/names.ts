import { kv } from '@vercel/kv'

/**
 * Name reservation system for walnut.world
 *
 * Keys in KV:
 *   name:{name}:owner     → "claimed" (permanent) or absent
 *   name:{name}:hold      → IP or session (TTL = hold duration)
 *   name:{name}:lapses    → number of times the hold lapsed without claim
 *
 * Hold duration escalation:
 *   0 lapses → 30 min
 *   1 lapse  → 1 hr
 *   2 lapses → 2 hr
 *   3 lapses → 4 hr
 *   4 lapses → 8 hr
 *   5+ lapses → 24 hr
 *
 * After 9 lapses without claim, the name is still available but
 * each new hold costs 24 hours.
 */

const BASE_HOLD_SECONDS = 30 * 60 // 30 minutes
const MAX_HOLD_SECONDS = 24 * 60 * 60 // 24 hours
const FOUNDING_NAMES = ['ben', 'attila', 'will', 'stuart', 'clara', 'leon']

function getHoldDuration(lapses: number): number {
  if (lapses <= 0) return BASE_HOLD_SECONDS
  const seconds = BASE_HOLD_SECONDS * Math.pow(2, lapses)
  return Math.min(seconds, MAX_HOLD_SECONDS)
}

export type NameStatus =
  | { status: 'taken' }
  | { status: 'held'; by: string; expiresIn: number }
  | { status: 'available' }
  | { status: 'cooldown'; retryIn: number }

export async function checkName(name: string): Promise<NameStatus> {
  const clean = name.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 20)
  if (!clean) return { status: 'taken' }

  // Founding names are permanently taken
  if (FOUNDING_NAMES.includes(clean)) {
    return { status: 'taken' }
  }

  // Check if permanently claimed
  const owner = await kv.get<string>(`name:${clean}:owner`)
  if (owner) return { status: 'taken' }

  // Check if currently held
  const hold = await kv.get<string>(`name:${clean}:hold`)
  if (hold) {
    const ttl = await kv.ttl(`name:${clean}:hold`)
    return { status: 'held', by: hold, expiresIn: ttl }
  }

  return { status: 'available' }
}

export interface ReserveResult {
  ok: boolean
  holdSeconds?: number
  error?: string
  retryIn?: number
}

export async function reserveName(name: string, holderId: string): Promise<ReserveResult> {
  const clean = name.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 20)
  if (!clean) return { ok: false, error: 'Invalid name' }

  if (FOUNDING_NAMES.includes(clean)) {
    return { ok: false, error: 'Name is taken' }
  }

  // Check if permanently claimed
  const owner = await kv.get<string>(`name:${clean}:owner`)
  if (owner) return { ok: false, error: 'Name is taken' }

  // Check if currently held by someone else
  const hold = await kv.get<string>(`name:${clean}:hold`)
  if (hold && hold !== holderId) {
    const ttl = await kv.ttl(`name:${clean}:hold`)
    return { ok: false, error: 'Name is currently held', retryIn: ttl }
  }

  // Get lapse count for escalating hold duration
  const lapses = (await kv.get<number>(`name:${clean}:lapses`)) ?? 0
  const holdSeconds = getHoldDuration(lapses)

  // Set the hold with TTL
  await kv.set(`name:${clean}:hold`, holderId, { ex: holdSeconds })

  // Increment lapse counter (the claim endpoint will reset it)
  // We increment now — if they actually claim, the counter resets
  await kv.set(`name:${clean}:lapses`, lapses + 1)

  return { ok: true, holdSeconds }
}

export async function claimName(name: string, holderId: string): Promise<{ ok: boolean; error?: string }> {
  const clean = name.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 20)
  if (!clean) return { ok: false, error: 'Invalid name' }

  // Verify the hold belongs to this holder
  const hold = await kv.get<string>(`name:${clean}:hold`)
  if (!hold || hold !== holderId) {
    return { ok: false, error: 'You don\'t hold this name' }
  }

  // Permanently claim
  await kv.set(`name:${clean}:owner`, 'claimed')
  // Clean up hold and lapses
  await kv.del(`name:${clean}:hold`)
  await kv.del(`name:${clean}:lapses`)

  return { ok: true }
}

import { kv } from '@vercel/kv'

/**
 * Link reservation system for walnut.world
 *
 * Keys in KV:
 *   link:{name}:owner      → "claimed" (permanent)
 *   link:{name}:hold       → hashed PIN (TTL = hold duration)
 *   link:{name}:pin        → hashed PIN (TTL = hold duration)
 *   link:{name}:lapses     → lapse count for escalating cooldown
 *
 * Flow:
 *   1. Check name → available
 *   2. Set 4-digit PIN → reserve for 24 hours
 *   3. Install Walnut, enter name + PIN → claim permanently
 *
 * Escalating cooldown on lapses:
 *   0 lapses → 24 hours
 *   1 lapse  → 24 hours (same)
 *   2+ lapses → 24 hours (capped, but lapse count tracks abuse)
 */

const HOLD_SECONDS = 24 * 60 * 60 // 24 hours
const FOUNDING_NAMES = ['ben', 'attila', 'will', 'stuart', 'clara', 'leon']

// Simple hash for PIN (not crypto-grade, but sufficient for holds)
function hashPin(pin: string): string {
  let h = 0
  for (let i = 0; i < pin.length; i++) {
    h = pin.charCodeAt(i) + ((h << 5) - h)
  }
  return Math.abs(h).toString(36)
}

export type NameStatus =
  | { status: 'taken' }
  | { status: 'held'; expiresIn: number }
  | { status: 'available' }

export async function checkName(name: string): Promise<NameStatus> {
  const clean = name.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 20)
  if (!clean) return { status: 'taken' }

  if (FOUNDING_NAMES.includes(clean)) {
    return { status: 'taken' }
  }

  const owner = await kv.get<string>(`link:${clean}:owner`)
  if (owner) return { status: 'taken' }

  const hold = await kv.get<string>(`link:${clean}:hold`)
  if (hold) {
    const ttl = await kv.ttl(`link:${clean}:hold`)
    return { status: 'held', expiresIn: ttl }
  }

  return { status: 'available' }
}

export interface ReserveResult {
  ok: boolean
  holdSeconds?: number
  error?: string
}

export async function reserveName(name: string, pin: string): Promise<ReserveResult> {
  const clean = name.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 20)
  if (!clean) return { ok: false, error: 'Invalid name' }
  if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    return { ok: false, error: 'PIN must be 4 digits' }
  }

  if (FOUNDING_NAMES.includes(clean)) {
    return { ok: false, error: 'Link is taken' }
  }

  const owner = await kv.get<string>(`link:${clean}:owner`)
  if (owner) return { ok: false, error: 'Link is taken' }

  const hold = await kv.get<string>(`link:${clean}:hold`)
  if (hold) return { ok: false, error: 'Link is currently held' }

  const hashed = hashPin(pin)

  // Reserve with 24hr TTL
  await kv.set(`link:${clean}:hold`, hashed, { ex: HOLD_SECONDS })
  await kv.set(`link:${clean}:pin`, hashed, { ex: HOLD_SECONDS })

  // Track lapses (incremented now, reset on permanent claim)
  const lapses = (await kv.get<number>(`link:${clean}:lapses`)) ?? 0
  await kv.set(`link:${clean}:lapses`, lapses + 1)

  return { ok: true, holdSeconds: HOLD_SECONDS }
}

export async function claimName(name: string, pin: string): Promise<{ ok: boolean; error?: string }> {
  const clean = name.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 20)
  if (!clean) return { ok: false, error: 'Invalid name' }

  const storedPin = await kv.get<string>(`link:${clean}:pin`)
  if (!storedPin || storedPin !== hashPin(pin)) {
    return { ok: false, error: 'Wrong PIN' }
  }

  // Permanently claim
  await kv.set(`link:${clean}:owner`, 'claimed')
  await kv.del(`link:${clean}:hold`)
  await kv.del(`link:${clean}:pin`)
  await kv.del(`link:${clean}:lapses`)

  return { ok: true }
}

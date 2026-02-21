'use client'

import { useState, useEffect } from 'react'
import { Apple, Send, Monitor } from 'lucide-react'
import { COPPER_GLASS, COPPER_SHEEN } from '@/lib/copper-glass'

const TAKEN_NAMES = ['ben', 'attila', 'will', 'stuart', 'clara', 'leon']

const WALL_TAGS = [
  ...TAKEN_NAMES.map(name => ({ name, active: true })),
  ...Array.from({ length: 4 }, (_, i) => ({
    name: String(i + 1).padStart(3, '0'),
    active: false,
  })),
]

function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = str.charCodeAt(i) + ((h << 5) - h)
  }
  return h
}

function getRotation(name: string): number {
  return (hash(name) % 5) - 2
}

function getOffset(name: string): { x: number; y: number } {
  const h = hash(name + 'xy')
  return { x: (h % 5) - 2, y: ((h >> 3) % 5) - 2 }
}

function ClaimCTA({ name }: { name: string }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(/iPhone|iPad|Android/i.test(navigator.userAgent))
  }, [])

  return (
    <div className="space-y-4">
      <p className="text-cream/70">
        <span className="text-cream">{name}.walnut.world</span> is yours — inside Walnut.
      </p>
      {isMobile ? (
        <>
          <a
            href={`mailto:?subject=Walnut%20%E2%80%94%20${name}.walnut.world&body=Claim%20your%20world%3A%20https%3A%2F%2Fwalnut.world`}
            className="inline-flex items-center gap-2.5 rounded-full border border-cream/20 bg-cream px-6 py-3 text-sm font-semibold text-[#1a1714] shadow-md transition-all hover:scale-[1.03] active:scale-100"
          >
            <Send className="size-4" />
            Send link to your Mac
          </a>
          <p className="text-xs text-cream/30">
            <Monitor className="mb-0.5 mr-1 inline size-3" />
            Walnut runs in your terminal
          </p>
        </>
      ) : (
        <>
          <a
            href="#download"
            className="inline-flex items-center gap-2.5 rounded-full border border-cream/20 bg-cream px-6 py-3 text-sm font-semibold text-[#1a1714] shadow-md transition-all hover:scale-[1.03] active:scale-100"
          >
            <Apple className="size-4" />
            Get Walnut for Mac
          </a>
          <p className="text-xs text-cream/30">
            Open source. Your files. Your machine.
          </p>
        </>
      )}
    </div>
  )
}

export function Wall() {
  const [input, setInput] = useState('')
  const [state, setState] = useState<'idle' | 'checking' | 'available' | 'taken' | 'held' | 'reserved' | 'claim'>('idle')
  const [holdMinutes, setHoldMinutes] = useState(0)
  const cleanName = input.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 20)

  // Check name availability via API (falls back to static list if API unavailable)
  useEffect(() => {
    if (!cleanName) {
      setState('idle')
      return
    }

    setState('checking')
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/name/check?name=${cleanName}`)
        if (res.ok) {
          const data = await res.json()
          if (data.status === 'taken') setState('taken')
          else if (data.status === 'held') setState('held')
          else setState('available')
        } else {
          // Fallback to static check
          setState(TAKEN_NAMES.includes(cleanName) ? 'taken' : 'available')
        }
      } catch {
        setState(TAKEN_NAMES.includes(cleanName) ? 'taken' : 'available')
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [cleanName])

  // Reserve name via API
  const handleClaim = async () => {
    if (state !== 'available') return

    try {
      const res = await fetch('/api/name/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName }),
      })
      const data = await res.json()

      if (data.ok) {
        setHoldMinutes(Math.ceil((data.holdSeconds ?? 1800) / 60))
        setState('reserved')
        if (typeof window !== 'undefined' && window.plausible) {
          window.plausible('Username Reserved', { props: { name: cleanName } })
        }
      } else {
        // Someone else grabbed it
        setState('taken')
      }
    } catch {
      // API down — show claim flow anyway
      setState('claim')
      if (typeof window !== 'undefined' && window.plausible) {
        window.plausible('Username Claimed', { props: { name: cleanName } })
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleClaim()
    }
  }

  return (
    <section className="relative px-4 py-24 sm:px-12">
      <div
        className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl p-8 sm:p-12"
        style={COPPER_GLASS}
      >
        {/* Copper sheen */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={COPPER_SHEEN}
        />

        {/* 1. THE WALL — title */}
        <div className="text-center">
          <h2 className="font-mono text-sm uppercase tracking-[0.3em] text-amber-light">
            The Wall
          </h2>
        </div>

        {/* 2. NAMES — the tags grid */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {WALL_TAGS.map((tag) => {
            const offset = getOffset(tag.name)
            return (
              <div
                key={tag.name}
                className="group relative"
                style={{
                  transform: `rotate(${getRotation(tag.name)}deg) translate(${offset.x}px, ${offset.y}px)`,
                }}
              >
                {tag.active ? (
                  <a
                    href={`/${tag.name}`}
                    className="block rounded-lg border border-amber/20 px-3 py-1.5 font-mono text-xs text-cream/80 transition-all hover:border-amber/40 hover:text-cream"
                  >
                    {tag.name}<span className="text-cream/40">.walnut.world</span>
                  </a>
                ) : (
                  <div className="rounded-lg border border-cream/[0.08] px-3 py-1.5 font-mono text-xs text-cream/25">
                    [ {tag.name} ]
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* 3. SOVEREIGNTY STAMP */}
        <div className="mx-auto mt-10 max-w-sm border-t border-b border-cream/[0.1] py-6 text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-cream/40">
            Your files. Your machine. Your rules.
          </div>
          <div className="mt-3 inline-flex items-center gap-3">
            <div className="h-px w-6 bg-amber/50" />
            <span className="font-mono text-xs tracking-widest text-amber/70">
              SOVEREIGN OPERATOR
            </span>
            <div className="h-px w-6 bg-amber/50" />
          </div>
          <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.4em] text-cream/40">
            Open source forever
          </div>
        </div>

        {/* 4. CLAIM YOUR WORLD — input */}
        <div className="mt-10 text-center">
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-cream/55">
            Claim your world
          </h3>
        </div>

        <div className="mx-auto mt-4 max-w-md">
          <div className="relative">
            <div className="flex items-center overflow-hidden rounded-xl border border-cream/15 bg-black/20">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="yourname"
                className="w-full bg-transparent px-4 py-3.5 font-mono text-base text-cream outline-none placeholder:text-cream/35"
                maxLength={20}
                autoComplete="off"
                spellCheck={false}
              />
              <span className="shrink-0 pr-4 font-mono text-sm text-cream/45">
                .walnut.world
              </span>
            </div>

            {cleanName && state !== 'idle' && (
              <div className="mt-3 text-center font-mono text-sm">
                {state === 'checking' && (
                  <span className="text-cream/40">checking...</span>
                )}
                {state === 'taken' && (
                  <span className="text-amber-light/80">
                    {cleanName}.walnut.world is taken
                  </span>
                )}
                {state === 'held' && (
                  <span className="text-amber-light/60">
                    {cleanName}.walnut.world is currently held
                  </span>
                )}
                {state === 'available' && (
                  <button
                    onClick={handleClaim}
                    className="group cursor-pointer text-emerald-400/90 transition-colors hover:text-emerald-300"
                  >
                    {cleanName}.walnut.world is available
                    <span className="ml-2 text-cream/30 transition-colors group-hover:text-cream/60">
                      press enter to save
                    </span>
                  </button>
                )}
                {state === 'reserved' && (
                  <div className="space-y-3">
                    <p className="text-emerald-400/90">
                      <span className="text-emerald-300">{cleanName}.walnut.world</span> saved for {holdMinutes} minutes
                    </p>
                    <ClaimCTA name={cleanName} />
                  </div>
                )}
                {state === 'claim' && (
                  <ClaimCTA name={cleanName} />
                )}
              </div>
            )}
          </div>
        </div>

        {/* 5. PRICING */}
        <div className="mt-8 text-center">
          <p className="text-sm text-cream/60">
            Free for the first 10,000 worldbuilders
          </p>
          <p className="group relative mt-1.5 inline-block cursor-default text-xs text-cream/40">
            After 10,000: one-time purchase, own it forever
            <span className="pointer-events-none absolute -bottom-20 left-1/2 z-10 w-64 -translate-x-1/2 rounded-lg bg-black/90 px-4 py-3 text-left text-xs leading-relaxed text-cream/60 opacity-0 shadow-lg backdrop-blur transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
              You don&apos;t need a world address to be a worldbuilder or use Walnut. Everything is open source. The domains are for the culture.
            </span>
          </p>
        </div>
      </div>
    </section>
  )
}

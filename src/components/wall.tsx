'use client'

import { useState, useEffect } from 'react'
import { Apple, Send, Monitor } from 'lucide-react'

const TAKEN_NAMES = ['ben', 'attila', 'stuart', 'will', 'clara', 'leon']

const WALL_TAGS = [
  ...TAKEN_NAMES.map(name => ({ name, active: true })),
  ...Array.from({ length: 12 }, (_, i) => ({
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
            className="inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-semibold transition-all hover:scale-105 hover:brightness-110 active:scale-100"
            style={{
              backgroundColor: '#D97706',
              color: '#FFF8EE',
              boxShadow: '0 4px 20px rgba(217, 119, 6, 0.3)',
            }}
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
            className="inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-semibold transition-all hover:scale-105 hover:brightness-110 active:scale-100"
            style={{
              backgroundColor: '#D97706',
              color: '#FFF8EE',
              boxShadow: '0 4px 20px rgba(217, 119, 6, 0.3)',
            }}
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

// Shared copper glass style for Wall card and Nav
export const COPPER_GLASS = {
  background: 'linear-gradient(135deg, rgba(120, 70, 25, 0.8) 0%, rgba(90, 50, 15, 0.75) 50%, rgba(120, 70, 25, 0.7) 100%)',
  backdropFilter: 'blur(32px) saturate(1.6)',
  WebkitBackdropFilter: 'blur(32px) saturate(1.6)',
  border: '1px solid rgba(217, 119, 6, 0.25)',
  boxShadow: 'inset 0 1px 0 0 rgba(255, 200, 100, 0.15), inset 0 -1px 0 0 rgba(0,0,0,0.2), 0 8px 40px -12px rgba(80, 40, 10, 0.4)',
} as const

export function Wall() {
  const [input, setInput] = useState('')
  const [state, setState] = useState<'idle' | 'checking' | 'available' | 'taken' | 'claim'>('idle')
  const cleanName = input.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 20)

  useEffect(() => {
    if (!cleanName) {
      setState('idle')
      return
    }

    setState('checking')
    const timer = setTimeout(() => {
      if (TAKEN_NAMES.includes(cleanName)) {
        setState('taken')
      } else {
        setState('available')
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [cleanName])

  const handleClaim = () => {
    if (state === 'available') {
      setState('claim')
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
          style={{ background: 'linear-gradient(90deg, transparent 10%, rgba(217, 119, 6, 0.3) 50%, transparent 90%)' }}
        />

        <div className="text-center">
          <h2 className="font-mono text-sm uppercase tracking-[0.3em] text-amber-light/70">
            The Wall
          </h2>
          <p className="mt-2 text-base text-cream/40">
            Claim your address — free for the first 10,000
          </p>
        </div>

        {/* Username checker */}
        <div className="mx-auto mt-8 max-w-md">
          <div className="relative">
            <div className="flex items-center overflow-hidden rounded-xl border border-cream/10 bg-black/20">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="yourname"
                className="w-full bg-transparent px-4 py-3.5 font-mono text-base text-cream outline-none placeholder:text-cream/25"
                maxLength={20}
                autoComplete="off"
                spellCheck={false}
              />
              <span className="shrink-0 pr-4 font-mono text-sm text-cream/30">
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
                {state === 'available' && (
                  <button
                    onClick={handleClaim}
                    className="group cursor-pointer text-emerald-400/90 transition-colors hover:text-emerald-300"
                  >
                    {cleanName}.walnut.world is available
                    <span className="ml-2 text-cream/30 transition-colors group-hover:text-cream/60">
                      press enter
                    </span>
                  </button>
                )}
                {state === 'claim' && (
                  <ClaimCTA name={cleanName} />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Existing tags */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
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
                <div
                  className={`rounded-lg border px-3 py-1.5 font-mono text-xs transition-all ${
                    tag.active
                      ? 'border-amber/20 text-cream/60'
                      : 'border-cream/[0.04] text-cream/15'
                  }`}
                >
                  {tag.active
                    ? <>{tag.name}<span className="text-cream/25">.walnut.world</span></>
                    : `[ ${tag.name} ]`
                  }
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

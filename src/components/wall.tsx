'use client'

import { useState, useEffect } from 'react'
import { Apple, Send, Monitor, Share2 } from 'lucide-react'
import { COPPER_GLASS, COPPER_SHEEN } from '@/lib/copper-glass'

const FOUNDING_NAMES = ['ben', 'attila', 'will', 'stuart', 'clara', 'leon']

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
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setIsMobile(/iPhone|iPad|Android/i.test(navigator.userAgent))
  }, [])

  const inviteLink = `https://invite.walnut.world/${name}`

  const copyInvite = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <p className="text-cream/70">
        <span className="text-cream">{name}.walnut.world</span> — build your world to activate it.
      </p>
      {isMobile ? (
        <a
          href={`mailto:?subject=Walnut%20%E2%80%94%20Build%20Your%20World&body=Open%20this%20on%20your%20Mac%3A%20https%3A%2F%2Fwalnut.world`}
          className="inline-flex items-center gap-2.5 rounded-full border border-cream/20 bg-cream px-6 py-3 text-sm font-semibold text-[#1a1714] shadow-md transition-all hover:scale-[1.03] active:scale-100"
        >
          <Send className="size-4" />
          Send link to your Mac
        </a>
      ) : (
        <a
          href="#download"
          className="inline-flex items-center gap-2.5 rounded-full border border-cream/20 bg-cream px-6 py-3 text-sm font-semibold text-[#1a1714] shadow-md transition-all hover:scale-[1.03] active:scale-100"
        >
          <Apple className="size-4" />
          Get Walnut for Mac
        </a>
      )}
      <div className="pt-2">
        <button
          onClick={copyInvite}
          className="inline-flex cursor-pointer items-center gap-2 font-mono text-xs text-cream/40 transition-colors hover:text-cream/60"
        >
          <Share2 className="size-3" />
          {copied ? 'copied!' : 'copy your invite link'}
        </button>
      </div>
    </div>
  )
}

export function Wall() {
  const [input, setInput] = useState('')
  const [pin, setPin] = useState('')
  const [securityQ, setSecurityQ] = useState('')
  const [securityA, setSecurityA] = useState('')
  const [state, setState] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'reserved_already' |
    'pin' | 'reserving' | 'reserved' | 'security' | 'done' | 'claim'
  >('idle')
  const [wallNames, setWallNames] = useState<string[]>(FOUNDING_NAMES)
  const [totalCount, setTotalCount] = useState(FOUNDING_NAMES.length)
  const [ref, setRef] = useState<string | undefined>()
  const cleanName = input.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 20)

  // Pick up ?ref= from URL for invite tracking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const r = params.get('ref')
    if (r) setRef(r)
  }, [])

  // Fetch existing wall names
  useEffect(() => {
    fetch('/api/name/list')
      .then(r => r.json())
      .then(data => {
        if (data.names) setWallNames(data.names)
        if (data.count) setTotalCount(data.count)
      })
      .catch(() => {})
  }, [])

  // Check name availability
  useEffect(() => {
    if (!cleanName) { setState('idle'); setPin(''); return }

    setState('checking')
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/name/check?name=${cleanName}`)
        if (res.ok) {
          const data = await res.json()
          if (data.status === 'taken') setState('taken')
          else if (data.status === 'reserved') setState('reserved_already')
          else setState('available')
          if (data.totalReserved) setTotalCount(data.totalReserved)
        } else {
          setState(FOUNDING_NAMES.includes(cleanName) ? 'taken' : 'available')
        }
      } catch {
        setState(FOUNDING_NAMES.includes(cleanName) ? 'taken' : 'available')
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [cleanName])

  const handleNameEnter = () => {
    if (state === 'available') setState('pin')
  }

  const handlePinSubmit = async () => {
    if (pin.length !== 4) return
    setState('reserving')

    try {
      const res = await fetch('/api/name/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, pin, invitedBy: ref }),
      })
      const data = await res.json()

      if (data.ok) {
        setTotalCount(data.count ?? totalCount + 1)
        setWallNames(prev => [...prev, cleanName])
        setState('reserved')
        if (typeof window !== 'undefined' && window.plausible) {
          window.plausible('Link Reserved', { props: { name: cleanName } })
        }
      } else {
        setState('taken')
      }
    } catch {
      // API down — show success anyway, will sync later
      setWallNames(prev => [...prev, cleanName])
      setState('reserved')
    }
  }

  const handleSecuritySubmit = async () => {
    if (!securityQ || !securityA) return

    try {
      await fetch('/api/name/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, pin, question: securityQ, answer: securityA }),
      })
    } catch {}

    setState('done')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleNameEnter()
  }

  const handlePinKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && pin.length === 4) handlePinSubmit()
  }

  const placeholderCount = Math.max(0, 4 - (wallNames.length - FOUNDING_NAMES.length))

  return (
    <section id="wall" className="relative px-4 py-24 sm:px-12">
      <div
        className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl p-8 sm:p-12"
        style={COPPER_GLASS}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={COPPER_SHEEN}
        />

        {/* 1. THE WALL — title + tally */}
        <div className="text-center">
          <h2 className="font-mono text-sm uppercase tracking-[0.3em] text-amber-light">
            The Wall
          </h2>
          <p className="mt-2 font-mono text-xs text-cream/40">
            {totalCount.toLocaleString()} / 10,000
          </p>
        </div>

        {/* 2. NAMES */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {wallNames.map((name) => {
            const offset = getOffset(name)
            const isFounding = FOUNDING_NAMES.includes(name)
            return (
              <div
                key={name}
                className="group relative"
                style={{
                  transform: `rotate(${getRotation(name)}deg) translate(${offset.x}px, ${offset.y}px)`,
                }}
              >
                <a
                  href={isFounding ? `/${name}` : `#`}
                  className={`block rounded-lg border border-amber/20 px-3 py-1.5 font-mono text-xs text-cream/80 transition-all hover:border-amber/40 hover:text-cream ${
                    !isFounding ? 'pointer-events-none' : ''
                  }`}
                >
                  {name}<span className="text-cream/40">.walnut.world</span>
                </a>
              </div>
            )
          })}
          {Array.from({ length: placeholderCount }, (_, i) => (
            <div
              key={`ph-${i}`}
              className="rounded-lg border border-cream/[0.08] px-3 py-1.5 font-mono text-xs text-cream/25"
              style={{
                transform: `rotate(${(i % 5) - 2}deg)`,
              }}
            >
              [ {String(i + 1).padStart(3, '0')} ]
            </div>
          ))}
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

        {/* 4. RESERVE YOUR LINK */}
        <div className="mt-10 text-center">
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-cream/55">
            Reserve your link
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
                {state === 'reserved_already' && (
                  <span className="text-amber-light/60">
                    {cleanName}.walnut.world is already reserved
                  </span>
                )}
                {state === 'available' && (
                  <button
                    onClick={handleNameEnter}
                    className="group cursor-pointer text-emerald-400/90 transition-colors hover:text-emerald-300"
                  >
                    {cleanName}.walnut.world is available
                    <span className="ml-2 text-cream/30 transition-colors group-hover:text-cream/60">
                      press enter
                    </span>
                  </button>
                )}
                {state === 'pin' && (
                  <div className="mt-2 space-y-3">
                    <p className="text-emerald-400/80">
                      Set a 4-digit PIN
                    </p>
                    <div className="mx-auto flex max-w-[160px] items-center justify-center">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        onKeyDown={handlePinKeyDown}
                        placeholder="• • • •"
                        className="w-full rounded-lg border border-cream/15 bg-black/20 px-4 py-3 text-center font-mono text-lg tracking-[0.5em] text-cream outline-none placeholder:text-cream/20"
                        maxLength={4}
                        autoFocus
                      />
                    </div>
                    {pin.length === 4 && (
                      <button
                        onClick={handlePinSubmit}
                        className="cursor-pointer text-emerald-400/90 transition-colors hover:text-emerald-300"
                      >
                        reserve {cleanName}.walnut.world →
                      </button>
                    )}
                    <p className="text-[11px] text-cream/25">
                      You&apos;ll use this PIN when links go live
                    </p>
                  </div>
                )}
                {state === 'reserving' && (
                  <span className="text-cream/40">reserving...</span>
                )}
                {state === 'reserved' && (
                  <div className="space-y-4">
                    <p className="text-emerald-400/90">
                      <span className="text-emerald-300">{cleanName}.walnut.world</span> is reserved
                    </p>
                    <p className="text-xs text-cream/40">
                      Want to set a security question in case you forget your PIN?
                    </p>
                    <button
                      onClick={() => setState('security')}
                      className="cursor-pointer font-mono text-xs text-cream/50 underline underline-offset-2 transition-colors hover:text-cream/70"
                    >
                      set security question
                    </button>
                    <span className="mx-3 text-cream/20">or</span>
                    <button
                      onClick={() => setState('done')}
                      className="cursor-pointer font-mono text-xs text-cream/50 underline underline-offset-2 transition-colors hover:text-cream/70"
                    >
                      skip
                    </button>
                  </div>
                )}
                {state === 'security' && (
                  <div className="mt-2 space-y-3">
                    <input
                      type="text"
                      value={securityQ}
                      onChange={(e) => setSecurityQ(e.target.value)}
                      placeholder="Your security question"
                      className="w-full rounded-lg border border-cream/15 bg-black/20 px-4 py-3 font-mono text-sm text-cream outline-none placeholder:text-cream/25"
                    />
                    <input
                      type="text"
                      value={securityA}
                      onChange={(e) => setSecurityA(e.target.value)}
                      placeholder="Your answer"
                      className="w-full rounded-lg border border-cream/15 bg-black/20 px-4 py-3 font-mono text-sm text-cream outline-none placeholder:text-cream/25"
                    />
                    {securityQ && securityA && (
                      <button
                        onClick={handleSecuritySubmit}
                        className="cursor-pointer text-emerald-400/90 transition-colors hover:text-emerald-300"
                      >
                        save →
                      </button>
                    )}
                  </div>
                )}
                {state === 'done' && (
                  <ClaimCTA name={cleanName} />
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
            First 10,000 links are free
          </p>
          <p className="group relative mt-1.5 inline-block cursor-default text-xs text-cream/40">
            After 10,000: one-time purchase, yours forever
            <span className="pointer-events-none absolute -bottom-20 left-1/2 z-10 w-64 -translate-x-1/2 rounded-lg bg-black/90 px-4 py-3 text-left text-xs leading-relaxed text-cream/60 opacity-0 shadow-lg backdrop-blur transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
              You don&apos;t need a link to use Walnut. Everything is open source. The links are for the culture.
            </span>
          </p>
        </div>
      </div>
    </section>
  )
}

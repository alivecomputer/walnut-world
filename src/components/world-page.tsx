'use client'

import Link from 'next/link'
import { COPPER_GLASS } from '@/lib/copper-glass'

interface WalnutCard {
  name: string
  type: 'venture' | 'experiment' | 'life' | 'person'
  phase: string
  description: string
}

interface WorldPageProps {
  owner: string
  tagline: string
  bio: string
  walnuts: WalnutCard[]
  accent?: string
}

const TYPE_LABELS: Record<string, string> = {
  venture: 'V',
  experiment: 'E',
  life: 'L',
  person: 'P',
}

const TYPE_COLORS: Record<string, string> = {
  venture: 'text-amber',
  experiment: 'text-emerald-400',
  life: 'text-sky-400',
  person: 'text-pink-400',
}

export function WorldPage({ owner, tagline, bio, walnuts }: WorldPageProps) {
  return (
    <div className="min-h-screen bg-[#0a0908]">
      {/* Header bar */}
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between rounded-2xl px-4 py-3" style={{
          ...COPPER_GLASS,
          background: 'linear-gradient(135deg, rgba(120, 70, 25, 0.7) 0%, rgba(90, 50, 15, 0.65) 50%, rgba(120, 70, 25, 0.6) 100%)',
        }}>
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-cream/10 font-mono text-xs text-cream/70">
              {owner[0].toUpperCase()}
            </div>
            <div>
              <span className="font-mono text-sm text-cream">{owner}</span>
              <span className="font-mono text-sm text-cream/30">.walnut.world</span>
            </div>
          </div>
          <Link
            href="/"
            className="font-mono text-xs text-cream/40 transition-colors hover:text-cream/70"
          >
            get yours →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-2xl px-4 pt-28 pb-20">
        <div className="mb-12">
          <h1
            className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight sm:text-5xl"
            style={{ color: '#FFF8EE' }}
          >
            {tagline}
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-cream/50">
            {bio}
          </p>
        </div>

        {/* Walnut cards */}
        <div className="space-y-3">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-cream/30">
            What I&apos;m building
          </h2>
          {walnuts.map((w) => (
            <div
              key={w.name}
              className="group rounded-xl border border-cream/[0.06] bg-cream/[0.03] p-4 transition-all hover:border-amber/20 hover:bg-cream/[0.05]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-xs font-bold ${TYPE_COLORS[w.type]}`}>
                    [{TYPE_LABELS[w.type]}]
                  </span>
                  <span className="font-medium text-cream/80">{w.name}</span>
                </div>
                <span className="shrink-0 rounded-full bg-cream/[0.06] px-2.5 py-0.5 font-mono text-xs text-cream/40">
                  {w.phase}
                </span>
              </div>
              <p className="mt-2 pl-10 text-sm text-cream/40">
                {w.description}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 border-t border-cream/[0.06] pt-8 text-center">
          <p className="text-sm text-cream/25">
            This world is powered by{' '}
            <Link href="/" className="text-amber/60 underline underline-offset-2 hover:text-amber">
              Walnut
            </Link>
          </p>
          <p className="mt-1 font-mono text-xs text-cream/15">
            open source context infrastructure
          </p>
        </div>
      </main>
    </div>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Walnut Packs — Marketplace',
  description: 'Community-built packs for Walnut. Rules, skills, configs, and experiences.',
  robots: { index: false },
}

const FEATURED_PACKS = [
  {
    name: 'deep-focus',
    author: 'ben',
    description: 'Rules for deep work sessions. Disables stash surfacing, minimal reads, single-walnut lock. For when you need to disappear into the work.',
    tags: ['rules', 'productivity'],
    downloads: '—',
  },
  {
    name: 'founder-mode',
    author: 'attila',
    description: 'Venture-first rules. Auto-surfaces revenue signals, investor context, and burn rate. The squirrel thinks like a CFO.',
    tags: ['rules', 'ventures'],
    downloads: '—',
  },
  {
    name: 'second-brain',
    author: 'stuart',
    description: 'Zettelkasten-inspired scratch conventions. Atomic notes, automatic linking, daily review ritual. For people who think in connections.',
    tags: ['config', 'knowledge'],
    downloads: '—',
  },
  {
    name: 'warm-copper',
    author: 'will',
    description: 'The default Walnut voice and visual config. Warm, confident, copper-toned. Included with every install but customizable.',
    tags: ['voice', 'config'],
    downloads: '—',
  },
  {
    name: 'dream-journal',
    author: 'community',
    description: 'Morning capture ritual. Opens a scratch file at session start, asks one question, routes to life domain. Surprisingly powerful over months.',
    tags: ['skill', 'life'],
    downloads: '—',
  },
  {
    name: 'meeting-router',
    author: 'ben',
    description: 'Paste a meeting transcript, get action items extracted and routed to the right walnuts. Works with Fathom, Otter, and raw text.',
    tags: ['skill', 'productivity'],
    downloads: '—',
  },
  {
    name: 'people-crm',
    author: 'community',
    description: 'Enhanced people watching. Birthday reminders, relationship health, follow-up cadence. Turns your people walnuts into a lightweight CRM.',
    tags: ['skill', 'people'],
    downloads: '—',
  },
  {
    name: 'psychedelic',
    author: '???',
    description: 'Altered-state journaling. Timed prompts, non-linear capture, integration routing the morning after. Handle with care.',
    tags: ['experience', 'experimental'],
    downloads: '—',
  },
  {
    name: 'grief',
    author: 'community',
    description: 'A gentle pack for processing loss. Creates a dedicated space with soft prompts, no productivity pressure, time-aware nudges. Some things need a walnut too.',
    tags: ['experience', 'life'],
    downloads: '—',
  },
]

const TAG_COLORS: Record<string, string> = {
  rules: 'text-sky-400 border-sky-400/20',
  config: 'text-violet-400 border-violet-400/20',
  skill: 'text-emerald-400 border-emerald-400/20',
  voice: 'text-pink-400 border-pink-400/20',
  experience: 'text-amber border-amber/20',
  productivity: 'text-cream/40 border-cream/10',
  ventures: 'text-cream/40 border-cream/10',
  knowledge: 'text-cream/40 border-cream/10',
  life: 'text-cream/40 border-cream/10',
  people: 'text-cream/40 border-cream/10',
  experimental: 'text-cream/40 border-cream/10',
}

export default function Marketplace() {
  return (
    <div className="min-h-screen bg-[#0a0908]">
      <div className="mx-auto max-w-3xl px-4 pt-16 pb-24">
        {/* Header */}
        <div className="mb-16">
          <Link href="/" className="font-mono text-xs text-cream/30 hover:text-cream/50">
            &larr; walnut.world
          </Link>
          <h1
            className="mt-8 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight sm:text-5xl"
            style={{ color: '#FFF8EE' }}
          >
            Walnut Packs
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-cream/50">
            Rules, skills, configs, and experiences built by the community.
            A walnut pack can be anything — a productivity system, a journaling ritual,
            an altered-state experience. This is the new software.
          </p>
          <div className="mt-6 flex items-center gap-4">
            <span className="rounded-full border border-amber/20 bg-amber/10 px-3 py-1 font-mono text-xs text-amber/70">
              coming soon
            </span>
            <span className="font-mono text-xs text-cream/25">
              submissions open at launch
            </span>
          </div>
        </div>

        {/* Pack types */}
        <div className="mb-12 flex flex-wrap gap-2">
          {['rules', 'skills', 'configs', 'voices', 'experiences'].map((type) => (
            <span key={type} className="rounded-lg border border-cream/[0.06] px-3 py-1.5 font-mono text-xs text-cream/30">
              {type}
            </span>
          ))}
        </div>

        {/* Pack grid */}
        <div className="space-y-3">
          {FEATURED_PACKS.map((pack) => (
            <div
              key={pack.name}
              className="group rounded-xl border border-cream/[0.06] bg-cream/[0.02] p-5 transition-all hover:border-amber/15 hover:bg-cream/[0.04]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-cream/80">{pack.name}</span>
                    <span className="font-mono text-xs text-cream/25">by {pack.author}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-cream/40">
                    {pack.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {pack.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`rounded border px-2 py-0.5 font-mono text-[10px] ${TAG_COLORS[tag] || 'text-cream/30 border-cream/10'}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit CTA */}
        <div className="mt-16 rounded-2xl border border-cream/[0.06] bg-cream/[0.02] p-8 text-center">
          <h2 className="font-mono text-sm uppercase tracking-[0.2em] text-cream/30">
            Build a pack
          </h2>
          <p className="mt-3 text-sm text-cream/40">
            A pack is a folder with rules, skills, and configs.
            If you can build a walnut, you can build a pack.
          </p>
          <p className="mt-6 font-mono text-xs text-cream/20">
            pack submission opens with walnut v0.1
          </p>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-sm text-cream/20">
            Powered by{' '}
            <Link href="/" className="text-amber/40 underline underline-offset-2 hover:text-amber/60">
              Walnut
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

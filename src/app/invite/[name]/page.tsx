import Link from 'next/link'
import { getInviteCount, cleanName } from '@/lib/names'
import type { Metadata } from 'next'

type Props = { params: Promise<{ name: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params
  return {
    title: `${name} invited you to Walnut`,
    description: `${name}.walnut.world — get your link and build your world.`,
  }
}

export default async function InvitePage({ params }: Props) {
  const { name } = await params
  const clean = cleanName(name)
  let inviteCount = 0

  try {
    inviteCount = await getInviteCount(clean)
  } catch {
    // KV not connected — show 0
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0908] px-4 text-center">
      <div className="max-w-md">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-amber/60">
          You&apos;ve been invited by
        </p>
        <h1
          className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight sm:text-5xl"
          style={{ color: '#FFF8EE' }}
        >
          {clean}
        </h1>
        <p className="mt-2 font-mono text-sm text-cream/40">
          {clean}.walnut.world
        </p>

        {inviteCount > 0 && (
          <p className="mt-6 font-mono text-sm text-cream/30">
            {inviteCount} {inviteCount === 1 ? 'person has' : 'people have'} joined through {clean}
          </p>
        )}

        <div className="mt-10">
          <Link
            href={`/#wall?ref=${clean}`}
            className="btn-glow inline-block"
          >
            <span className="btn-glow-inner">
              Reserve your link
            </span>
          </Link>
        </div>

        <p
          className="mt-6 text-sm"
          style={{ color: 'rgba(255, 248, 238, 0.35)' }}
        >
          Your context. Your machine. Your world.
        </p>

        <div className="mt-12">
          <Link href="/" className="font-mono text-xs text-cream/25 hover:text-cream/40">
            walnut.world
          </Link>
        </div>
      </div>
    </div>
  )
}

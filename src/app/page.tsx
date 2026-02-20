'use client'

import { useState, useCallback } from 'react'
import { VideoCanvas } from '@/components/video-canvas'
import { Header } from '@/components/header'
import { Hero } from '@/components/hero'
import { Wall } from '@/components/wall'
import { RotateCcw } from 'lucide-react'

export default function Home() {
  const [phase, setPhase] = useState<'home' | 'transitioning' | 'post'>('home')

  const handleDownloadClick = useCallback(() => {
    setPhase('transitioning')
  }, [])

  const handleTransitionComplete = useCallback(() => {
    setPhase('post')
  }, [])

  const handleReset = useCallback(() => {
    setPhase('home')
  }, [])

  return (
    <>
      <VideoCanvas
        transitioning={phase === 'transitioning'}
        onTransitionComplete={handleTransitionComplete}
      />

      {/* Normal state: hero + wall */}
      {phase === 'home' && (
        <div className="transition-opacity duration-700">
          <Header />
          <main>
            <Hero onDownloadClick={handleDownloadClick} />
            <Wall />
          </main>
        </div>
      )}

      {/* Transitioning: everything faded out, canvas plays */}
      {phase === 'transitioning' && (
        <div className="pointer-events-none opacity-0" />
      )}

      {/* Post-transition: just the wall + refresh */}
      {phase === 'post' && (
        <div className="animate-in fade-in duration-1000">
          <main className="pt-16">
            <Wall />
            <div className="flex justify-center pb-16">
              <button
                onClick={handleReset}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-cream/10 px-5 py-2.5 font-mono text-xs text-cream/40 transition-all hover:border-cream/20 hover:text-cream/60"
              >
                <RotateCcw className="size-3" />
                back to start
              </button>
            </div>
          </main>
        </div>
      )}
    </>
  )
}

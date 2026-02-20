'use client'

import { Apple, Monitor, Send } from 'lucide-react'
import { useEffect, useState } from 'react'

interface HeroProps {
  onDownloadClick?: () => void
}

export function Hero({ onDownloadClick }: HeroProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(/iPhone|iPad|Android/i.test(navigator.userAgent))
  }, [])

  return (
    <section className="relative flex flex-col items-center justify-center px-4 text-center" style={{ minHeight: isMobile ? '220vh' : '100vh' }}>
      <div className={isMobile ? 'sticky top-0 flex min-h-screen flex-col items-center justify-center' : 'contents'}>
      <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-cream/20 bg-cream/10 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-cream/70 backdrop-blur-sm">
        Open Source
      </span>
      <h1
        className="font-[family-name:var(--font-display)] text-5xl font-semibold tracking-tight sm:text-7xl md:text-8xl lg:text-9xl"
        style={{ color: '#FFF8EE', textShadow: '0 2px 20px rgba(0,0,0,0.4), 0 0 60px rgba(0,0,0,0.2)' }}
      >
        Build Your World.
      </h1>
      <p
        className="mt-6 max-w-lg text-lg sm:text-xl"
        style={{ color: 'rgba(255, 248, 238, 0.6)', textShadow: '0 1px 12px rgba(0,0,0,0.4)' }}
      >
        Your context. Your machine. Your world.
      </p>
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        {isMobile ? (
          <a
            href={`mailto:?subject=Walnut%20%E2%80%94%20Build%20Your%20World&body=Open%20this%20on%20your%20Mac%3A%20https%3A%2F%2Fwalnut.world`}
            className="inline-flex items-center gap-2.5 rounded-full border border-cream/20 bg-cream px-8 py-3.5 text-base font-semibold text-[#1a1714] shadow-lg shadow-black/10 transition-all hover:scale-[1.03] hover:shadow-xl active:scale-100"
          >
            <Send className="size-4" />
            Send to your Mac
          </a>
        ) : (
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && window.plausible) window.plausible('Download Click')
              onDownloadClick?.()
            }}
            className="group inline-flex cursor-pointer items-center gap-2.5 rounded-full border border-cream/20 bg-cream px-8 py-3.5 text-base font-semibold text-[#1a1714] shadow-lg shadow-black/10 transition-all hover:scale-[1.03] hover:shadow-xl hover:shadow-black/15 active:scale-100"
          >
            <Apple className="size-5" />
            Build Your World on Mac
          </button>
        )}
        {isMobile && (
          <p className="max-w-xs text-xs" style={{ color: 'rgba(255, 248, 238, 0.35)' }}>
            <Monitor className="mb-0.5 mr-1 inline size-3" />
            Walnut runs in your terminal. Send the link to your Mac to get started.
          </p>
        )}
        <a
          href="https://alivecomputer.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm underline underline-offset-4 transition-colors hover:opacity-80"
          style={{ color: 'rgba(255, 248, 238, 0.4)', textShadow: '0 1px 8px rgba(0,0,0,0.3)' }}
        >
          Read the thesis
        </a>
      </div>
      {isMobile && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce font-mono text-xs text-cream/25">
          scroll to explore
        </div>
      )}
      </div>
    </section>
  )
}

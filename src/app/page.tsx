'use client'

import { useState, useCallback } from 'react'
import { VideoCanvas } from '@/components/video-canvas'
import { Header } from '@/components/header'
import { Hero } from '@/components/hero'
import { Wall } from '@/components/wall'

export default function Home() {
  const [transitioning, setTransitioning] = useState(false)

  const handleDownloadClick = useCallback(() => {
    setTransitioning(true)
  }, [])

  return (
    <>
      <VideoCanvas transitioning={transitioning} />
      <div
        className="transition-opacity duration-700"
        style={{ opacity: transitioning ? 0 : 1, pointerEvents: transitioning ? 'none' : 'auto' }}
      >
        <Header />
        <main>
          <Hero onDownloadClick={handleDownloadClick} />
          <Wall />
        </main>
      </div>
    </>
  )
}

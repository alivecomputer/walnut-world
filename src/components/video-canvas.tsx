'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const TOTAL_FRAMES = 71
const TRANSITION_FRAMES = 73
const FRAME_PATH = '/frames/frame-'
const TRANSITION_PATH = '/transition/frame-'
const DOWNLOAD_URL = 'https://github.com/alivecomputer/walnut/releases'

function getFrameSrc(index: number, path: string): string {
  const padded = String(index + 1).padStart(3, '0')
  return `${path}${padded}.webp`
}

interface VideoCanvasProps {
  transitioning?: boolean
  onTransitionComplete?: () => void
}

export function VideoCanvas({ transitioning, onTransitionComplete }: VideoCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const framesRef = useRef<HTMLImageElement[]>([])
  const transitionFramesRef = useRef<HTMLImageElement[]>([])
  const currentFrameRef = useRef(0)
  const targetFrameRef = useRef(0)
  const [loaded, setLoaded] = useState(false)
  const [transitionLoaded, setTransitionLoaded] = useState(false)
  const [motionPermission, setMotionPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt')
  const rafRef = useRef<number>(0)
  const autoPlayRef = useRef(true)
  const transitioningRef = useRef(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const isMobileRef = useRef(false)

  useEffect(() => {
    isMobileRef.current = /iPhone|iPad|Android/i.test(navigator.userAgent)
  }, [])

  // Preload hero frames
  useEffect(() => {
    let count = 0
    const images: HTMLImageElement[] = []
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image()
      img.src = getFrameSrc(i, FRAME_PATH)
      img.onload = () => { count++; if (count === TOTAL_FRAMES) { framesRef.current = images; setLoaded(true) } }
      images.push(img)
    }
  }, [])

  // Preload transition frames in background
  useEffect(() => {
    let count = 0
    const images: HTMLImageElement[] = []
    for (let i = 0; i < TRANSITION_FRAMES; i++) {
      const img = new Image()
      img.src = getFrameSrc(i, TRANSITION_PATH)
      img.onload = () => { count++; if (count === TRANSITION_FRAMES) { transitionFramesRef.current = images; setTransitionLoaded(true) } }
      images.push(img)
    }
  }, [])

  // Draw frame from any source
  const drawFrameFrom = useCallback((frames: HTMLImageElement[], index: number) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const img = frames[index]
    if (!canvas || !ctx || !img) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight)
    const x = (canvas.width - img.naturalWidth * scale) / 2
    const y = (canvas.height - img.naturalHeight * scale) / 2
    ctx.drawImage(img, x, y, img.naturalWidth * scale, img.naturalHeight * scale)
  }, [])

  const drawFrame = useCallback((index: number) => {
    drawFrameFrom(framesRef.current, index)
  }, [drawFrameFrom])

  // === TRANSITION: play second video, then callback ===
  useEffect(() => {
    if (!transitioning || !transitionLoaded) return
    transitioningRef.current = true
    cancelAnimationFrame(rafRef.current)

    if (overlayRef.current) {
      overlayRef.current.style.transition = 'opacity 0.5s'
      overlayRef.current.style.opacity = '0'
    }

    let frame = 0
    const interval = 1000 / 24
    let lastTime = performance.now()

    const play = (now: number) => {
      const delta = now - lastTime
      if (delta >= interval) {
        lastTime = now - (delta % interval)
        drawFrameFrom(transitionFramesRef.current, frame)
        frame++
      }
      if (frame < TRANSITION_FRAMES) {
        rafRef.current = requestAnimationFrame(play)
      } else {
        drawFrameFrom(transitionFramesRef.current, TRANSITION_FRAMES - 1)
        window.open(DOWNLOAD_URL, '_blank', 'noopener,noreferrer')
        // After a beat, trigger the post-transition state
        setTimeout(() => onTransitionComplete?.(), 1500)
      }
    }

    rafRef.current = requestAnimationFrame(play)
    return () => cancelAnimationFrame(rafRef.current)
  }, [transitioning, transitionLoaded, drawFrameFrom, onTransitionComplete])

  // === MOBILE: scroll-driven scrubbing ===
  useEffect(() => {
    if (!loaded || transitioning) return
    if (!isMobileRef.current) return

    drawFrame(0)

    const handleScroll = () => {
      // Map scroll position to frame index
      // The video occupies the first viewport height of scroll
      const scrollY = window.scrollY
      const maxScroll = window.innerHeight * 1.2 // 120vh of scroll scrubs all frames
      const ratio = Math.min(scrollY / maxScroll, 1)
      const index = Math.floor(ratio * (TOTAL_FRAMES - 1))

      if (index !== currentFrameRef.current) {
        currentFrameRef.current = index
        drawFrame(index)
        // Haptic on every 4th frame
        if (navigator.vibrate && index % 4 === 0) navigator.vibrate(6)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    const handleResize = () => drawFrame(currentFrameRef.current)
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [loaded, transitioning, drawFrame])

  // === DESKTOP: radial mouse scrubbing ===
  useEffect(() => {
    if (!loaded || transitioning) return
    if (isMobileRef.current) return

    drawFrame(0)
    let floatFrame = 0

    const animate = () => {
      if (transitioningRef.current) return

      if (autoPlayRef.current) {
        floatFrame = (floatFrame + 0.15) % TOTAL_FRAMES
        const index = Math.floor(floatFrame)
        if (index !== currentFrameRef.current) {
          currentFrameRef.current = index
          drawFrame(index)
        }
      } else {
        const target = targetFrameRef.current
        const diff = target - floatFrame
        if (Math.abs(diff) > 0.3) {
          // Lerp speed: faster when target is high (near center)
          const targetRatio = target / TOTAL_FRAMES
          const speed = 0.04 + 0.14 * targetRatio
          floatFrame += diff * speed
          const index = Math.round(floatFrame)
          const clamped = Math.max(0, Math.min(TOTAL_FRAMES - 1, index))
          if (clamped !== currentFrameRef.current) {
            currentFrameRef.current = clamped
            drawFrame(clamped)
          }
        }
      }
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    const handleMouse = (e: MouseEvent) => {
      autoPlayRef.current = false
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2

      // Normalize to -1..1 with tighter bounds (0.85 of half-dimension)
      // so the mouse effect reaches edges sooner
      const dx = (e.clientX - cx) / (cx * 0.85)
      const dy = (e.clientY - cy) / (cy * 0.7)

      const distance = Math.min(Math.sqrt(dx * dx + dy * dy), 1.0)

      // Invert: close to center = last frame, edge = first frame
      const ratio = 1 - distance
      // Ease-in: SLOW build from edges, ACCELERATES toward center
      const eased = ratio * ratio * ratio
      targetFrameRef.current = Math.floor(eased * (TOTAL_FRAMES - 1))
    }

    const handleMouseLeave = () => { autoPlayRef.current = true }

    window.addEventListener('mousemove', handleMouse)
    document.addEventListener('mouseleave', handleMouseLeave)

    const handleResize = () => drawFrame(currentFrameRef.current)
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('mousemove', handleMouse)
      document.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('resize', handleResize)
    }
  }, [loaded, transitioning, drawFrame])

  // === MOBILE: device orientation (gyro) ===
  useEffect(() => {
    if (!loaded || transitioning) return
    if (!isMobileRef.current) return
    if (motionPermission !== 'granted') return

    // Gyro adds subtle offset ON TOP of scroll position
    const handleOrientation = (e: DeviceOrientationEvent) => {
      const gamma = e.gamma ?? 0
      const beta = e.beta ?? 0
      const restBeta = 45
      const betaDev = Math.abs(beta - restBeta)
      const gammaDev = Math.abs(gamma)
      const tiltMag = Math.sqrt(betaDev * betaDev + gammaDev * gammaDev)
      const tiltOffset = Math.floor((tiltMag / 60) * 8) // up to 8 frames of gyro offset

      const scrollFrame = currentFrameRef.current
      const combined = Math.min(TOTAL_FRAMES - 1, Math.max(0, scrollFrame + tiltOffset))
      if (combined !== currentFrameRef.current) {
        currentFrameRef.current = combined
        drawFrame(combined)
        if (navigator.vibrate && tiltOffset > 4) navigator.vibrate(6)
      }
    }

    window.addEventListener('deviceorientation', handleOrientation)
    return () => window.removeEventListener('deviceorientation', handleOrientation)
  }, [loaded, transitioning, motionPermission, drawFrame])

  // iOS motion permission
  const requestMotionPermission = useCallback(async () => {
    const DME = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
    if (typeof DME.requestPermission === 'function') {
      try {
        const result = await DME.requestPermission()
        setMotionPermission(result as 'granted' | 'denied')
      } catch { setMotionPermission('denied') }
    } else { setMotionPermission('granted') }
  }, [])

  useEffect(() => {
    if (!isMobileRef.current) return
    const DME = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
    if (typeof DME.requestPermission === 'function') {
      const h = () => { requestMotionPermission(); window.removeEventListener('touchstart', h) }
      window.addEventListener('touchstart', h, { once: true })
      return () => window.removeEventListener('touchstart', h)
    } else { setMotionPermission('granted') }
  }, [requestMotionPermission])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 h-full w-full"
        style={{ willChange: 'transform', zIndex: -1 }}
      />
      <div
        ref={overlayRef}
        className="pointer-events-none fixed inset-0"
        style={{
          zIndex: -1,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 40%, rgba(0,0,0,0.1) 60%, rgba(26,23,20,0.85) 90%, rgba(26,23,20,1) 100%)',
        }}
      />
    </>
  )
}

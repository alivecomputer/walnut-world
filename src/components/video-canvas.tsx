'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const TOTAL_FRAMES = 73
const FRAME_PATH = '/frames/frame-'
const TRANSITION_PATH = '/transition/frame-'
const DOWNLOAD_URL = 'https://github.com/alivecomputer/walnut/releases'

function getCTACenter(): { x: number; y: number } {
  return { x: window.innerWidth / 2, y: window.innerHeight / 2 }
}

function getFrameSrc(index: number, path: string): string {
  const padded = String(index + 1).padStart(3, '0')
  return `${path}${padded}.webp`
}

interface VideoCanvasProps {
  transitioning?: boolean
}

export function VideoCanvas({ transitioning }: VideoCanvasProps) {
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

  // Preload hero frames
  useEffect(() => {
    let loadedCount = 0
    const images: HTMLImageElement[] = []
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image()
      img.src = getFrameSrc(i, FRAME_PATH)
      img.onload = () => {
        loadedCount++
        if (loadedCount === TOTAL_FRAMES) {
          framesRef.current = images
          setLoaded(true)
        }
      }
      images.push(img)
    }
  }, [])

  // Preload transition frames in background
  useEffect(() => {
    let loadedCount = 0
    const images: HTMLImageElement[] = []
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image()
      img.src = getFrameSrc(i, TRANSITION_PATH)
      img.onload = () => {
        loadedCount++
        if (loadedCount === TOTAL_FRAMES) {
          transitionFramesRef.current = images
          setTransitionLoaded(true)
        }
      }
      images.push(img)
    }
  }, [])

  // Draw any frame from any source to canvas
  const drawFrameFrom = useCallback((frames: HTMLImageElement[], index: number) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const img = frames[index]
    if (!canvas || !ctx || !img) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const scale = Math.max(
      canvas.width / img.naturalWidth,
      canvas.height / img.naturalHeight
    )
    const x = (canvas.width - img.naturalWidth * scale) / 2
    const y = (canvas.height - img.naturalHeight * scale) / 2

    ctx.drawImage(img, x, y, img.naturalWidth * scale, img.naturalHeight * scale)
  }, [])

  const drawFrame = useCallback((index: number) => {
    drawFrameFrom(framesRef.current, index)
  }, [drawFrameFrom])

  // Transition: play second video at 24fps, open link at end
  useEffect(() => {
    if (!transitioning || !transitionLoaded) return
    transitioningRef.current = true

    // Cancel any existing animation
    cancelAnimationFrame(rafRef.current)

    // Fade out the overlay
    if (overlayRef.current) {
      overlayRef.current.style.transition = 'opacity 0.5s'
      overlayRef.current.style.opacity = '0'
    }

    let frame = 0
    const fps = 24
    const interval = 1000 / fps
    let lastTime = performance.now()

    const playTransition = (now: number) => {
      const delta = now - lastTime
      if (delta >= interval) {
        lastTime = now - (delta % interval)
        drawFrameFrom(transitionFramesRef.current, frame)
        frame++
      }

      if (frame < TOTAL_FRAMES) {
        rafRef.current = requestAnimationFrame(playTransition)
      } else {
        // Freeze on last frame, open download in new tab
        drawFrameFrom(transitionFramesRef.current, TOTAL_FRAMES - 1)
        window.open(DOWNLOAD_URL, '_blank', 'noopener,noreferrer')
      }
    }

    rafRef.current = requestAnimationFrame(playTransition)

    return () => cancelAnimationFrame(rafRef.current)
  }, [transitioning, transitionLoaded, drawFrameFrom])

  // Main interactive loop (only when not transitioning)
  useEffect(() => {
    if (!loaded || transitioning) return

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
        if (Math.abs(diff) > 0.5) {
          const speed = 0.06 + 0.08 * (1 - floatFrame / TOTAL_FRAMES)
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
      const center = getCTACenter()
      const dx = (e.clientX - center.x) / (window.innerWidth / 2) * 1.4
      const dy = (e.clientY - center.y) / (window.innerHeight / 2) * 1.8
      const distance = Math.min(Math.sqrt(dx * dx + dy * dy), 1.0)
      const ratio = 1 - distance
      const eased = 1 - Math.pow(1 - ratio, 3)
      targetFrameRef.current = Math.floor(eased * (TOTAL_FRAMES - 1))
    }

    const handleMouseLeave = () => { autoPlayRef.current = true }

    const handleOrientation = (e: DeviceOrientationEvent) => {
      autoPlayRef.current = false
      const beta = e.beta ?? 0
      const gamma = e.gamma ?? 0
      const restBeta = 45
      const betaDev = Math.abs(beta - restBeta)
      const gammaDev = Math.abs(gamma)
      const tiltMagnitude = Math.sqrt(betaDev * betaDev + gammaDev * gammaDev)
      const maxTilt = 60
      const ratio = 1 - Math.min(tiltMagnitude / maxTilt, 1)
      const eased = ratio * ratio
      const index = Math.floor(eased * (TOTAL_FRAMES - 1))
      if (Math.abs(index - currentFrameRef.current) >= 2) {
        if (navigator.vibrate) navigator.vibrate(8)
      }
      targetFrameRef.current = index
    }

    window.addEventListener('mousemove', handleMouse)
    document.addEventListener('mouseleave', handleMouseLeave)
    if (motionPermission === 'granted') {
      window.addEventListener('deviceorientation', handleOrientation)
    }
    const handleResize = () => drawFrame(currentFrameRef.current)
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('mousemove', handleMouse)
      document.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('deviceorientation', handleOrientation)
      window.removeEventListener('resize', handleResize)
    }
  }, [loaded, transitioning, motionPermission, drawFrame])

  // iOS motion permission
  const requestMotionPermission = useCallback(async () => {
    const DME = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
    if (typeof DME.requestPermission === 'function') {
      try {
        const result = await DME.requestPermission()
        setMotionPermission(result as 'granted' | 'denied')
      } catch { setMotionPermission('denied') }
    } else {
      setMotionPermission('granted')
    }
  }, [])

  useEffect(() => {
    const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent)
    if (!isMobile) return
    const DME = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
    if (typeof DME.requestPermission === 'function') {
      const handleTouch = () => { requestMotionPermission(); window.removeEventListener('touchstart', handleTouch) }
      window.addEventListener('touchstart', handleTouch, { once: true })
      return () => window.removeEventListener('touchstart', handleTouch)
    } else {
      setMotionPermission('granted')
    }
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

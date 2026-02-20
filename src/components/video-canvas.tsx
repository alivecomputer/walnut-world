'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const TOTAL_FRAMES = 73
const FRAME_PATH = '/frames/frame-'

// The CTA button is centered on screen — this is the gravity well
// We compute the center of the viewport as the anchor point
function getCTACenter(): { x: number; y: number } {
  return {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  }
}

// Max possible distance from center to any corner
function getMaxRadius(): number {
  const cx = window.innerWidth / 2
  const cy = window.innerHeight / 2
  return Math.sqrt(cx * cx + cy * cy)
}

function getFrameSrc(index: number): string {
  const padded = String(index + 1).padStart(3, '0')
  return `${FRAME_PATH}${padded}.webp`
}

export function VideoCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const framesRef = useRef<HTMLImageElement[]>([])
  const currentFrameRef = useRef(0)
  const targetFrameRef = useRef(0)
  const [loaded, setLoaded] = useState(false)
  const [motionPermission, setMotionPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt')
  const rafRef = useRef<number>(0)
  const autoPlayRef = useRef(true)

  // Preload all frames
  useEffect(() => {
    let loadedCount = 0
    const images: HTMLImageElement[] = []

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image()
      img.src = getFrameSrc(i)
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

  // Draw frame to canvas
  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const img = framesRef.current[index]
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

  // Smooth interpolation loop
  useEffect(() => {
    if (!loaded) return

    drawFrame(0)

    let floatFrame = 0

    const animate = () => {
      if (autoPlayRef.current) {
        // Auto-loop slowly
        floatFrame = (floatFrame + 0.15) % TOTAL_FRAMES
        const index = Math.floor(floatFrame)
        if (index !== currentFrameRef.current) {
          currentFrameRef.current = index
          drawFrame(index)
        }
      } else {
        // Smooth lerp toward target frame
        const target = targetFrameRef.current
        const diff = target - floatFrame

        if (Math.abs(diff) > 0.5) {
          // Slower lerp as we approach center (high frame numbers)
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

    // Desktop: radial distance from CTA center
    // Y-axis weighted 1.8x heavier for more vertical sensitivity
    const handleMouse = (e: MouseEvent) => {
      autoPlayRef.current = false
      const center = getCTACenter()

      const dx = (e.clientX - center.x) / (window.innerWidth / 2) * 1.4
      const dy = (e.clientY - center.y) / (window.innerHeight / 2) * 1.8

      const distance = Math.min(Math.sqrt(dx * dx + dy * dy), 1.0)

      // Invert: close to center = last frame (zoomed in), edge = first frame
      const ratio = 1 - distance
      // Cubic ease-out: fast at edges, decelerates approaching center
      const eased = 1 - Math.pow(1 - ratio, 3)
      targetFrameRef.current = Math.floor(eased * (TOTAL_FRAMES - 1))
    }

    // Resume auto-play when mouse leaves
    const handleMouseLeave = () => {
      autoPlayRef.current = true
    }

    // Mobile: device orientation — tilt magnitude from level
    const handleOrientation = (e: DeviceOrientationEvent) => {
      autoPlayRef.current = false
      const beta = e.beta ?? 0  // front-back tilt (-180 to 180)
      const gamma = e.gamma ?? 0 // left-right tilt (-90 to 90)

      // Distance from "level" position (phone flat: beta=0, gamma=0 when held upright ~45deg)
      // Normalize: phone upright is beta ~45-90, flat is beta ~0
      // Use deviation from a "resting" position
      const restBeta = 45 // typical holding angle
      const betaDev = Math.abs(beta - restBeta)
      const gammaDev = Math.abs(gamma)

      const tiltMagnitude = Math.sqrt(betaDev * betaDev + gammaDev * gammaDev)
      const maxTilt = 60

      // Invert: level (pointed at screen) = zoomed in, tilted = zoomed out
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
  }, [loaded, motionPermission, drawFrame])

  // iOS motion permission
  const requestMotionPermission = useCallback(async () => {
    const DME = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>
    }
    if (typeof DME.requestPermission === 'function') {
      try {
        const result = await DME.requestPermission()
        setMotionPermission(result as 'granted' | 'denied')
      } catch {
        setMotionPermission('denied')
      }
    } else {
      setMotionPermission('granted')
    }
  }, [])

  // Auto-request on mobile
  useEffect(() => {
    const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent)
    if (!isMobile) return

    const DME = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>
    }
    if (typeof DME.requestPermission === 'function') {
      const handleTouch = () => {
        requestMotionPermission()
        window.removeEventListener('touchstart', handleTouch)
      }
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
      {/* Gentle atmospheric depth — not a veil, just enough for text contrast */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          zIndex: -1,
          background: [
            'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 40%, rgba(0,0,0,0.1) 60%, rgba(26,23,20,0.85) 90%, rgba(26,23,20,1) 100%)',
          ].join(', '),
        }}
      />
    </>
  )
}

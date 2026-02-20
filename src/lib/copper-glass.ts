import type { CSSProperties } from 'react'

/**
 * COPPER GLASS — Walnut's signature material. LOCKED.
 *
 * Warm metallic translucency. Not Apple's cold frosted glass.
 * Three intensities for different contexts. Do not modify without
 * updating the brand guidelines.
 */

// Full card — The Wall, modals, panels
export const COPPER_GLASS: CSSProperties = {
  background:
    'linear-gradient(135deg, rgba(160, 95, 35, 0.55) 0%, rgba(130, 75, 28, 0.5) 50%, rgba(160, 95, 35, 0.45) 100%)',
  backdropFilter: 'blur(32px) saturate(1.8)',
  WebkitBackdropFilter: 'blur(32px) saturate(1.8)',
  border: '1px solid rgba(217, 119, 6, 0.3)',
  boxShadow:
    'inset 0 1px 0 0 rgba(255, 200, 100, 0.2), inset 0 -1px 0 0 rgba(0,0,0,0.1), 0 8px 40px -12px rgba(80, 40, 10, 0.35)',
}

// Nav on scroll — slightly more transparent
export const COPPER_GLASS_NAV: CSSProperties = {
  background:
    'linear-gradient(135deg, rgba(160, 95, 35, 0.5) 0%, rgba(130, 75, 28, 0.45) 50%, rgba(160, 95, 35, 0.4) 100%)',
  backdropFilter: 'blur(32px) saturate(1.8)',
  WebkitBackdropFilter: 'blur(32px) saturate(1.8)',
  border: '1px solid rgba(217, 119, 6, 0.25)',
  boxShadow:
    'inset 0 1px 0 0 rgba(255, 200, 100, 0.15), 0 8px 32px -8px rgba(80, 40, 10, 0.3)',
}

// Copper sheen — 1px top highlight strip
export const COPPER_SHEEN: CSSProperties = {
  background:
    'linear-gradient(90deg, transparent 10%, rgba(217, 119, 6, 0.35) 50%, transparent 90%)',
}

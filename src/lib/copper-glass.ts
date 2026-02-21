import type { CSSProperties } from 'react'

/**
 * COPPER GLASS — Walnut's signature material. LOCKED.
 *
 * Warm copper translucency with solid backing to prevent muddy blur.
 * Inner content sits on a dark warm base, outer shell is copper glass.
 */

// Full card — The Wall, modals, panels
// Solid warm-dark inner prevents muddy blur while keeping copper glow
export const COPPER_GLASS: CSSProperties = {
  background: 'linear-gradient(145deg, rgba(140, 85, 30, 0.6) 0%, rgba(110, 65, 22, 0.55) 50%, rgba(140, 85, 30, 0.5) 100%)',
  backdropFilter: 'blur(40px) saturate(1.5) brightness(0.6)',
  WebkitBackdropFilter: 'blur(40px) saturate(1.5) brightness(0.6)',
  border: '1px solid rgba(217, 119, 6, 0.3)',
  boxShadow: 'inset 0 1px 0 0 rgba(255, 200, 100, 0.2), inset 0 0 80px 0 rgba(80, 40, 10, 0.4), 0 24px 64px -16px rgba(0, 0, 0, 0.5)',
}

// Nav on scroll — copper glass, thinner
export const COPPER_GLASS_NAV: CSSProperties = {
  background: 'linear-gradient(135deg, rgba(140, 85, 30, 0.55) 0%, rgba(110, 65, 22, 0.5) 50%, rgba(140, 85, 30, 0.45) 100%)',
  backdropFilter: 'blur(40px) saturate(1.5) brightness(0.6)',
  WebkitBackdropFilter: 'blur(40px) saturate(1.5) brightness(0.6)',
  border: '1px solid rgba(217, 119, 6, 0.2)',
  boxShadow: 'inset 0 1px 0 0 rgba(255, 200, 100, 0.15), inset 0 0 40px 0 rgba(80, 40, 10, 0.3), 0 8px 32px -8px rgba(0, 0, 0, 0.4)',
}

// Copper sheen — 1px top highlight strip
export const COPPER_SHEEN: CSSProperties = {
  background: 'linear-gradient(90deg, transparent 10%, rgba(217, 119, 6, 0.35) 50%, transparent 90%)',
}

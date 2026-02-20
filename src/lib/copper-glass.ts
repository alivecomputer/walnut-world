import type { CSSProperties } from 'react'

/**
 * COPPER CARD — Walnut's signature surface. LOCKED.
 *
 * Dark base with copper accents. NOT glassmorphism on light backgrounds.
 * The video behind is light — we need dark surfaces for contrast.
 */

// Full card — The Wall, modals, panels
export const COPPER_GLASS: CSSProperties = {
  background: 'linear-gradient(145deg, rgba(18, 14, 10, 0.92) 0%, rgba(26, 20, 14, 0.95) 50%, rgba(18, 14, 10, 0.92) 100%)',
  border: '1px solid rgba(217, 119, 6, 0.2)',
  boxShadow: 'inset 0 1px 0 0 rgba(217, 119, 6, 0.12), 0 24px 64px -16px rgba(0, 0, 0, 0.6)',
}

// Nav on scroll — dark with copper edge
export const COPPER_GLASS_NAV: CSSProperties = {
  background: 'rgba(14, 11, 8, 0.88)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(217, 119, 6, 0.15)',
  boxShadow: 'inset 0 1px 0 0 rgba(217, 119, 6, 0.08), 0 8px 32px -8px rgba(0, 0, 0, 0.5)',
}

// Copper sheen — 1px top highlight strip
export const COPPER_SHEEN: CSSProperties = {
  background: 'linear-gradient(90deg, transparent 10%, rgba(217, 119, 6, 0.25) 50%, transparent 90%)',
}

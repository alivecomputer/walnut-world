'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import React from 'react'
import { useScroll, useMotionValueEvent } from 'motion/react'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const CREAM = '#FFF8EE'

import { COPPER_GLASS_NAV } from '@/lib/copper-glass'

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 50)
  })

  return (
    <header data-state={isMobileMenuOpen ? 'active' : 'inactive'}>
      <div className={cn(
        'max-lg:in-data-[state=active]:h-screen max-lg:h-18 fixed inset-x-0 top-0 z-50 pt-2 max-lg:overflow-hidden max-lg:px-2 lg:pt-3',
        'max-lg:in-data-[state=active]:backdrop-blur-xl max-lg:in-data-[state=active]:bg-black/60'
      )}>
        <div
          className={cn(
            'mx-auto w-full rounded-2xl border border-transparent px-3 transition-all duration-500 ease-in-out',
            isScrolled ? 'max-w-3xl px-5' : 'max-w-6xl',
          )}
          style={isScrolled ? COPPER_GLASS_NAV : undefined}
        >
          <div className="relative flex flex-wrap items-center justify-between lg:py-3">
            <div className="max-lg:in-data-[state=active]:border-b max-lg:in-data-[state=active]:border-white/10 flex items-center justify-between gap-8 max-lg:h-14 max-lg:w-full">
              <Link href="/" aria-label="home" className="h-fit transition-all duration-500">
                <img
                  src="/walnut-logo.svg"
                  alt="Walnut"
                  className="h-10 w-auto"
                  style={{ filter: 'drop-shadow(0 1px 8px rgba(0,0,0,0.3))' }}
                />
              </Link>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
                className="relative z-20 -m-2.5 -mr-3 block cursor-pointer p-2.5 lg:hidden">
                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-5 duration-200" style={{ color: CREAM }} />
                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-5 -rotate-180 scale-0 opacity-0 duration-200" style={{ color: CREAM }} />
              </button>
            </div>

            {/* Desktop nav */}
            <nav className="absolute inset-0 m-auto hidden size-fit lg:flex">
              <ul className="flex items-center gap-1">
                <li>
                  <Link href="https://alivecomputer.com" target="_blank" rel="noopener noreferrer" className="rounded-lg px-3 py-2 text-sm font-medium transition-colors" style={{ color: 'rgba(255, 248, 238, 0.5)', textShadow: '0 1px 6px rgba(0,0,0,0.3)' }}>
                    Thesis
                  </Link>
                </li>
                <li>
                  <Link href="https://skool.com/aliveoperators" target="_blank" rel="noopener noreferrer" className="rounded-lg px-3 py-2 text-sm font-medium transition-colors" style={{ color: 'rgba(255, 248, 238, 0.5)', textShadow: '0 1px 6px rgba(0,0,0,0.3)' }}>
                    Community
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Mobile nav */}
            {isMobileMenuOpen && (
              <nav className="w-full pt-4 pb-6 lg:hidden">
                <ul className="space-y-1">
                  <li>
                    <Link href="https://alivecomputer.com" target="_blank" onClick={() => setIsMobileMenuOpen(false)} className="block rounded-lg px-3 py-3 text-lg font-medium" style={{ color: CREAM }}>
                      Thesis
                    </Link>
                  </li>
                  <li>
                    <Link href="https://skool.com/aliveoperators" target="_blank" onClick={() => setIsMobileMenuOpen(false)} className="block rounded-lg px-3 py-3 text-lg font-medium" style={{ color: CREAM }}>
                      Community
                    </Link>
                  </li>
                </ul>
                <div className="mt-6 flex flex-col gap-3 px-3">
                  <Button asChild size="sm" className="rounded-full bg-amber text-cream hover:bg-amber/90">
                    <Link href="#download">Get Walnut</Link>
                  </Button>
                </div>
              </nav>
            )}

            {/* Desktop CTA */}
            <div className="hidden items-center gap-3 lg:flex">
              <Button asChild size="sm" className="rounded-full bg-amber text-cream hover:bg-amber/90">
                <Link href="#download">Get Walnut</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

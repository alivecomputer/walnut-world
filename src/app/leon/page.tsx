import { WorldPage } from '@/components/world-page'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'leon.walnut.world',
  description: "Leon Flint's world — Furano365, Hokkaido, Japan.",
}

export default function LeonWorld() {
  return (
    <WorldPage
      owner="leon"
      tagline="365 days of powder."
      bio="Hokkaido, Japan. Running Furano365 — where people come to experience real seasons. Proof that you can build a world from anywhere, and that the best businesses are built around the life you want to live."
      walnuts={[
        {
          name: 'Furano365',
          type: 'venture',
          phase: 'growing',
          description: 'Tourism and hospitality in Furano, Hokkaido. Ski season, lavender season, every season. The business IS the lifestyle.',
        },
        {
          name: 'Hokkaido Life',
          type: 'life',
          phase: 'living',
          description: 'Seasons, mountains, food, community. What it looks like when your world is exactly where you want to be.',
        },
        {
          name: 'Property',
          type: 'venture',
          phase: 'active',
          description: 'Real estate in one of the most beautiful places on earth. Building the portfolio one season at a time.',
        },
      ]}
    />
  )
}

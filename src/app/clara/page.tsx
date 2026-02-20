import { WorldPage } from '@/components/world-page'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'clara.walnut.world',
  description: "Clara's world — the foundation everything else is built on.",
}

export default function ClaraWorld() {
  return (
    <WorldPage
      owner="clara"
      tagline="Life is the foundation."
      bio="The reason the framework starts with L. Ventures and experiments serve life goals — not the other way around. Building a world that keeps what matters at the center."
      walnuts={[
        {
          name: 'Home',
          type: 'life',
          phase: 'building',
          description: 'The project that matters most. Where we live, how we live, what we\'re building together.',
        },
        {
          name: 'Recipes & Rituals',
          type: 'life',
          phase: 'collecting',
          description: 'The meals, the rhythms, the things that make a house a home. Documented so they compound.',
        },
        {
          name: 'People',
          type: 'person',
          phase: 'always',
          description: 'Family, friends, the people who make the world worth building. Everyone gets a walnut.',
        },
      ]}
    />
  )
}

import { WorldPage } from '@/components/world-page'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'stuart.walnut.world',
  description: "Stuart Smyth's world — researcher, systems thinker.",
}

export default function StuartWorld() {
  return (
    <WorldPage
      owner="stuart"
      tagline="Context is the compound interest of knowledge."
      bio="Researcher. Spent years in government watching institutions forget what they knew. Now studying how individuals can build knowledge systems that outlast every platform."
      walnuts={[
        {
          name: 'AI Operator Research',
          type: 'venture',
          phase: 'active',
          description: 'Mapping how early ALIVE users build compound context. What works, what breaks, what compounds.',
        },
        {
          name: 'Institutional Memory',
          type: 'experiment',
          phase: 'writing',
          description: 'Paper on why institutions lose context and how file-based personal systems solve what databases couldn\'t.',
        },
        {
          name: 'Reading Stack',
          type: 'life',
          phase: 'ongoing',
          description: 'Systems theory, information architecture, organizational design. The reading list that feeds everything else.',
        },
      ]}
    />
  )
}

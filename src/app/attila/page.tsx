import { WorldPage } from '@/components/world-page'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'attila.walnut.world',
  description: "Attila Mora's world — quantum tinkerer, creative collaborator.",
}

export default function AttilaWorld() {
  return (
    <WorldPage
      owner="attila"
      tagline="The walnut is the metaphor."
      bio="Creative collaborator and quantum tinkerer. Coined the walnut and squirrel metaphors that became the product language. Thinks in systems, writes in images. First external ALIVE user."
      walnuts={[
        {
          name: 'The Walnut & The Apple',
          type: 'venture',
          phase: 'writing',
          description: 'The counter-mythology. Why the next revolution in computing starts with a hard shell protecting something valuable.',
        },
        {
          name: 'Quantum Patterns',
          type: 'experiment',
          phase: 'exploring',
          description: 'Research into how quantum principles map to context systems. Observer effects in knowledge management.',
        },
        {
          name: 'Manifesto',
          type: 'venture',
          phase: 'v8',
          description: 'Co-architect of the ALIVE manifesto. Eight versions deep. The profound things always look simple after.',
        },
      ]}
    />
  )
}

import { WorldPage } from '@/components/world-page'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'will.walnut.world',
  description: "Will Bainbridge's world — AI UX and interaction design.",
}

export default function WillWorld() {
  return (
    <WorldPage
      owner="will"
      tagline="The last mile belongs to design."
      bio="AI UX and interaction designer. Obsessed with how humans and AI systems should feel together. Don't give the last mile to the intern — the interface IS the product."
      walnuts={[
        {
          name: 'Walnut UX',
          type: 'venture',
          phase: 'designing',
          description: 'Designing the interaction patterns for ALIVE. How do you make a file system feel alive? How does context surface without being noisy?',
        },
        {
          name: 'Terminal Aesthetics',
          type: 'experiment',
          phase: 'prototyping',
          description: 'Exploring how CLI tools can have beautiful, warm UX. The terminal doesn\'t have to feel cold.',
        },
        {
          name: 'Design Systems',
          type: 'life',
          phase: 'collecting',
          description: 'Cataloguing the design systems that got it right. What makes a tool feel like it belongs to you.',
        },
      ]}
    />
  )
}

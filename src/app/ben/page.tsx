import { WorldPage } from '@/components/world-page'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ben.walnut.world',
  description: "Ben Flint's world — building the first alive computer.",
}

export default function BenWorld() {
  return (
    <WorldPage
      owner="ben"
      tagline="Building the machine that remembers."
      bio="Founder of Walnut. Generalist optimizer. Believes the right systems, owned by the operator, compound faster than any institution can hire for. Currently in a Forest City lock-in sprint shipping v0.1."
      walnuts={[
        {
          name: 'Sovereign Systems',
          type: 'venture',
          phase: 'launching',
          description: 'The company behind Walnut. Open source context infrastructure. Ship the product, build the community, change how people work with AI.',
        },
        {
          name: 'The Book',
          type: 'venture',
          phase: 'drafting',
          description: '"Becoming an AI Operator" — 25 chapters on why systems beat teams and how to build yours.',
        },
        {
          name: 'Billion Dollar Hackathon',
          type: 'experiment',
          phase: 'planning',
          description: '10 platforms. 10 days. 10 minds. The thesis at national scale.',
        },
        {
          name: 'Clara',
          type: 'person',
          phase: 'always',
          description: 'Partner. The foundation everything else is built on.',
        },
      ]}
    />
  )
}

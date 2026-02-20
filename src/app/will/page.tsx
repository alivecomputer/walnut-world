import { WorldPage } from '@/components/world-page'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'will.walnut.world',
  description: "Will Bainbridge's world — AI researcher, 6 months in the lab.",
}

export default function WillWorld() {
  return (
    <WorldPage
      owner="will"
      tagline="Six months in the lab."
      bio="AI researcher. Spent half a year deep in the models — studying how context compounds, how agents degrade, where the architecture breaks. The research that became Walnut's foundation."
      walnuts={[
        {
          name: 'ALIVE Research',
          type: 'venture',
          phase: 'publishing',
          description: 'The empirical basis for alive computers. What happens when you give an agent persistent context across sessions. What breaks. What compounds.',
        },
        {
          name: 'Agent Architecture',
          type: 'experiment',
          phase: 'active',
          description: 'Testing how different context structures affect agent performance. File-based vs database. Flat vs nested. The experiments that shaped the ALIVE framework.',
        },
        {
          name: 'Lab Notes',
          type: 'life',
          phase: 'ongoing',
          description: 'Six months of findings, dead ends, and breakthroughs. The raw material behind the thesis.',
        },
      ]}
    />
  )
}

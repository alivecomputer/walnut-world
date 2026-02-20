import { VideoCanvas } from '@/components/video-canvas'
import { Header } from '@/components/header'
import { Hero } from '@/components/hero'
import { Wall } from '@/components/wall'

export default function Home() {
  return (
    <>
      <VideoCanvas />
      <Header />
      <main>
        <Hero />
        <Wall />
      </main>
    </>
  )
}

import { Benchmarks } from '@organisms/Benchmarks'
import { Footer } from '@organisms/Footer'
import { Nav } from '@organisms/Nav'
import { Reserve } from '@organisms/Reserve'
import { Specs } from '@organisms/Specs'
import { Stage } from '@organisms/Stage'
import { MotionProvider } from '@providers/MotionProvider'
import { SmoothScroll } from '@providers/SmoothScroll'
import { ThermalProvider } from '@providers/ThermalProvider'

export default function Home() {
  return (
    <MotionProvider>
      <SmoothScroll>
        <ThermalProvider>
          <Nav />
          <Stage />
          <Specs />
          <Benchmarks />
          <Reserve />
          <Footer />
        </ThermalProvider>
      </SmoothScroll>
    </MotionProvider>
  )
}

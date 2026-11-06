import { Nav } from '@organisms/Nav'
import { MotionProvider } from '@providers/MotionProvider'
import { SmoothScroll } from '@providers/SmoothScroll'
import { ThermalProvider } from '@providers/ThermalProvider'

export default function Home() {
  return (
    <MotionProvider>
      <SmoothScroll>
        <ThermalProvider>
          <Nav />
        </ThermalProvider>
      </SmoothScroll>
    </MotionProvider>
  )
}

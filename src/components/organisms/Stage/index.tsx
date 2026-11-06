'use client'

import { useRef, useState } from 'react'

import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from 'motion/react'
import dynamic from 'next/dynamic'

import { chapterAt } from '@domain/gpu'
import { useThermal } from '@providers/ThermalProvider'

import { Captions } from './Captions'
import { Hud } from './Hud'

// three.js só no navegador, num pedaço separado do bundle
const GpuScene = dynamic(() => import('./GpuScene'), { ssr: false })

export function Stage() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })
  const rpm = useMotionValue(2780)
  const [chapter, setChapter] = useState(0)
  const [ready, setReady] = useState(false)
  const { thermal } = useThermal()

  useMotionValueEvent(scrollYProgress, 'change', (p) =>
    setChapter(chapterAt(p)),
  )
  const hintOpacity = useTransform(scrollYProgress, [0, 0.03], [1, 0])

  return (
    <div ref={ref} data-stage className="relative h-[560vh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* fundo de estúdio: luz atrás da placa, caindo para as bordas */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_65%_at_58%_46%,#2c3345_0%,#171c28_40%,#090b10_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(var(--color-line)_1px,transparent_1px),linear-gradient(90deg,var(--color-line)_1px,transparent_1px)] mask-[radial-gradient(ellipse_at_50%_55%,#000_10%,transparent_70%)] bg-size-[64px_64px] opacity-30" />
        <motion.div
          role="img"
          aria-label="Modelo 3D da placa de vídeo Halcyon H9"
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={ready ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 1.4, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <GpuScene
            progress={scrollYProgress}
            rpm={rpm}
            thermal={thermal}
            onReady={() => setReady(true)}
          />
        </motion.div>
        <Hud progress={scrollYProgress} rpm={rpm} thermal={thermal} />
        <Captions index={chapter} />
        <motion.div
          style={{ opacity: hintOpacity }}
          className="absolute right-[max(16px,env(safe-area-inset-right,0px))] bottom-5 font-mono text-[11px] tracking-widest text-muted"
        >
          ROLE{' '}
          <motion.span
            className="inline-block"
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            ↓
          </motion.span>
        </motion.div>
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-line">
          <motion.i
            className="block h-full origin-left bg-hot"
            style={{ scaleX: scrollYProgress }}
          />
        </div>
      </div>
    </div>
  )
}

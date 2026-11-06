'use client'

import {
  AnimatePresence,
  motion,
  useTransform,
  type MotionValue,
} from 'motion/react'

import { temperatures } from '@domain/gpu'

const CORNERS = [
  'top-0 left-0 border-t border-l',
  'top-0 right-0 border-t border-r',
  'bottom-0 left-0 border-b border-l',
  'right-0 bottom-0 border-r border-b',
]

interface Props {
  progress: MotionValue<number>
  rpm: MotionValue<number>
  thermal: boolean
}

export function Hud({ progress, rpm, thermal }: Props) {
  const die = useTransform(progress, (p) => temperatures(p).die)
  const vram = useTransform(progress, (p) => temperatures(p).vram)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.6 }}
      className="pointer-events-none absolute inset-[72px_max(16px,env(safe-area-inset-right,0px))_24px_max(16px,env(safe-area-inset-left,0px))]"
    >
      {CORNERS.map((c) => (
        <i key={c} className={`absolute size-[22px] border-muted/60 ${c}`} />
      ))}
      <div className="absolute top-3.5 left-5 font-mono text-[11px] leading-[1.8] tracking-[.06em] text-muted tabular-nums">
        CAM 01 · ORBITAL
        <br />
        DIE <motion.span className="text-fg">{die}</motion.span>°C · VRAM{' '}
        <motion.span className="text-fg">{vram}</motion.span>°C
        <br />
        FAN <motion.span className="text-fg">{rpm}</motion.span> RPM
      </div>
      <AnimatePresence>
        {thermal && (
          <motion.div
            aria-hidden
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            className="absolute top-1/2 right-4 flex h-[46%] -translate-y-1/2 items-stretch gap-2 font-mono text-[10px] text-muted max-md:hidden"
          >
            <i className="w-2 rounded-[1px] bg-linear-to-b from-heat-max via-hot to-heat-cold" />
            <div className="flex flex-col justify-between">
              <span>88°</span>
              <span>65°</span>
              <span>42°</span>
              <span>24°</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

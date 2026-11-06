'use client'

import { useRef } from 'react'

import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'

import { gain, type Benchmark } from '@domain/gpu'
import { cn } from '@lib/utils'

function Bar({
  label,
  value,
  max,
  grow,
  highlight,
}: {
  label: string
  value: number
  max: number
  grow: MotionValue<number>
  highlight?: boolean
}) {
  return (
    <div className="mt-1.5 flex items-center gap-3">
      <span className="w-10 flex-none font-mono text-[11px] text-muted sm:w-16">
        {label}
      </span>
      <div className="relative h-[22px] min-w-0 flex-1 bg-panel">
        <motion.div
          className={cn(
            'absolute inset-y-0 left-0 origin-left',
            highlight
              ? 'bg-linear-to-r from-heat-mid via-hot to-heat-max'
              : 'bg-muted/50',
          )}
          style={{ width: `${(value / max) * 100}%`, scaleX: grow }}
        />
      </div>
      <span className="w-12 flex-none text-right font-mono text-[13px] tabular-nums sm:w-14">
        {value}
      </span>
    </div>
  )
}

export function BenchRow({ bench }: { bench: Benchmark }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 92%', 'start 60%'],
  })
  const grow = useTransform(scrollYProgress, [0, 1], [0, 1])
  const max = Math.max(bench.h9, bench.h7)

  return (
    <div ref={ref}>
      <div className="mb-2 flex flex-wrap justify-between gap-3 font-mono text-xs tracking-[.06em] text-muted">
        <span>{bench.name}</span>
        <motion.span className="text-hot" style={{ opacity: grow }}>
          +{gain(bench)}%
        </motion.span>
      </div>
      <Bar label="H9" value={bench.h9} max={max} grow={grow} highlight />
      <Bar label="H7" value={bench.h7} max={max} grow={grow} />
    </div>
  )
}

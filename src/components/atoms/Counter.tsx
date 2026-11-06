'use client'

import { useEffect, useRef } from 'react'

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useTransform,
} from 'motion/react'

import { formatSpec } from '@domain/gpu'

interface Props {
  value: number
  decimals?: number
}

export function Counter({ value, decimals = 0 }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -12% 0px' })
  const current = useMotionValue(0)
  const text = useTransform(current, (v) => formatSpec(v, decimals))

  useEffect(() => {
    if (!inView) return
    const controls = animate(current, value, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
    })
    return () => controls.stop()
  }, [inView, current, value])

  return (
    <motion.span ref={ref} aria-label={formatSpec(value, decimals)}>
      {text}
    </motion.span>
  )
}

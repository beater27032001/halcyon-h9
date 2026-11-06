'use client'

import { motion } from 'motion/react'

import { Chip } from '@atoms/Chip'
import { EASE } from '@constants/motion'
import { useThermal } from '@providers/ThermalProvider'

export function Nav() {
  const { thermal, toggle } = useThermal()
  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
      className="fixed inset-x-0 top-[env(safe-area-inset-top,0px)] z-20 flex h-14 items-center justify-between gap-3 bg-linear-to-b from-bg to-transparent pr-[max(16px,env(safe-area-inset-right,0px))] pl-[max(16px,env(safe-area-inset-left,0px))]"
    >
      <span className="font-display text-[22px] font-black tracking-[.06em] uppercase">
        Halcyon <b className="text-hot">H9</b>
      </span>
      <Chip aria-pressed={thermal} onClick={toggle}>
        Visão térmica
      </Chip>
    </motion.nav>
  )
}

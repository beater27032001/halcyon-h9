'use client'

import { motion } from 'motion/react'

import { EASE } from '@constants/motion'

export function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string
  title: string
}) {
  return (
    <motion.header
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.6 }}
      transition={{ staggerChildren: 0.1 }}
    >
      <motion.div
        className="eyebrow"
        variants={{
          hidden: { opacity: 0, x: -12 },
          show: { opacity: 1, x: 0 },
        }}
      >
        {eyebrow}
      </motion.div>
      <div className="overflow-hidden">
        <motion.h2
          className="m-0 mt-[.2em] mb-[.5em] font-display text-[clamp(40px,6vw,76px)] leading-[.92] font-extrabold text-balance uppercase"
          variants={{ hidden: { y: '100%' }, show: { y: 0 } }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          {title}
        </motion.h2>
      </div>
    </motion.header>
  )
}

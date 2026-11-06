'use client'

import { motion } from 'motion/react'

import { Counter } from '@atoms/Counter'
import { EASE } from '@constants/motion'
import { SPECS } from '@domain/gpu'
import { SectionHeading } from '@molecules/SectionHeading'

export function Specs() {
  return (
    <section
      data-section="specs"
      className="border-t border-line py-20 md:py-[120px]"
    >
      <div className="wrap">
        <SectionHeading eyebrow="Especificações" title="Números de bancada" />
        <motion.ul
          className="m-0 grid list-none grid-cols-2 border-t border-l border-line p-0 md:grid-cols-3"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ staggerChildren: 0.08 }}
        >
          {SPECS.map((spec) => (
            <motion.li
              key={spec.label}
              className="group min-w-0 border-r border-b border-line px-4 pt-7 pb-6 transition-colors hover:bg-panel sm:px-6"
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, ease: EASE },
                },
              }}
            >
              <div className="font-display text-[clamp(40px,6vw,72px)] leading-none font-extrabold tabular-nums">
                <Counter value={spec.value} decimals={spec.decimals} />
                {spec.unit && (
                  <small className="ml-1 text-[.42em] font-semibold text-muted transition-colors group-hover:text-hot">
                    {spec.unit}
                  </small>
                )}
              </div>
              <div className="mt-2.5 font-mono text-[11px] tracking-[.12em] text-muted uppercase">
                {spec.label}
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}

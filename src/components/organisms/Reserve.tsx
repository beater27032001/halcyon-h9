'use client'

import { useState } from 'react'

import { AnimatePresence, motion } from 'motion/react'

import { Counter } from '@atoms/Counter'
import { EASE } from '@constants/motion'
import { PRICE } from '@domain/gpu'
import { cn } from '@lib/utils'

export function Reserve() {
  const [reserved, setReserved] = useState(false)

  return (
    <section className="border-t border-line py-20 md:py-[120px]">
      <motion.div
        className="wrap"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <div className="eyebrow">Reserva</div>
        <div className="font-display text-[clamp(56px,9vw,120px)] leading-[.9] font-black tabular-nums">
          <Counter value={PRICE} prefix="R$ " />
        </div>
        <p className="mt-4 max-w-[46ch] text-muted">
          Primeiro lote com entrega prevista para março. A reserva não cobra
          nada agora.
        </p>
        <motion.button
          className={cn(
            'mt-6 min-w-[220px] overflow-hidden rounded-[2px] px-[26px] py-4 text-[15px] font-semibold text-[#0b0b0b] transition-colors',
            reserved ? 'bg-heat-max' : 'bg-hot',
          )}
          whileHover={reserved ? undefined : { scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setReserved(true)}
          disabled={reserved}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={reserved ? 'ok' : 'cta'}
              className="block"
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -18, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {reserved ? 'Reservada ✓' : 'Reservar a minha'}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </motion.div>
    </section>
  )
}

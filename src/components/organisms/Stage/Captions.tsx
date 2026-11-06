'use client'

import { Fragment } from 'react'

import { AnimatePresence, motion } from 'motion/react'

import { EASE } from '@constants/motion'
import { CHAPTERS } from '@domain/gpu'

const TITLE =
  'm-0 mt-[.15em] mb-[.2em] font-display font-black leading-[.88] tracking-[.01em] text-balance uppercase'

export function Captions({ index }: { index: number }) {
  const chapter = CHAPTERS[index]
  const isCover = index === 0

  return (
    <div className="pointer-events-none absolute inset-x-[max(16px,env(safe-area-inset-left,0px))] bottom-12">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          className={
            isCover
              ? 'absolute bottom-0 left-0 max-w-full'
              : 'absolute bottom-0 left-0 max-w-[560px]'
          }
          initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -16, filter: 'blur(6px)' }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <div className="eyebrow">{chapter.kicker}</div>
          {isCover ? (
            <h1
              className={`${TITLE} text-[clamp(64px,13vw,168px)]`}
              aria-label={chapter.title}
            >
              {chapter.title.split(' ').map((word, w, words) => {
                const offset = words.slice(0, w).join('').length
                return (
                  <Fragment key={word}>
                    {w > 0 && ' '}
                    <span
                      aria-hidden
                      className="inline-block whitespace-nowrap"
                    >
                      {[...word].map((letter, i) => (
                        <motion.span
                          key={i}
                          className="inline-block"
                          initial={{ y: '0.6em', opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{
                            duration: 0.7,
                            delay: 0.3 + (offset + i) * 0.04,
                            ease: EASE,
                          }}
                        >
                          {letter}
                        </motion.span>
                      ))}
                    </span>
                  </Fragment>
                )
              })}
            </h1>
          ) : (
            <h2 className={`${TITLE} text-[clamp(40px,7vw,84px)]`}>
              {chapter.title}
            </h2>
          )}
          <p className="m-0 max-w-[44ch] text-muted">{chapter.text}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

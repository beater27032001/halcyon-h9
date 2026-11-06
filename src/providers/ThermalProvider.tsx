'use client'

import { createContext, use, useState } from 'react'

const ThermalContext = createContext<{
  thermal: boolean
  toggle: () => void
} | null>(null)

export function ThermalProvider({ children }: { children: React.ReactNode }) {
  const [thermal, setThermal] = useState(false)
  return (
    <ThermalContext value={{ thermal, toggle: () => setThermal((t) => !t) }}>
      {children}
    </ThermalContext>
  )
}

export const useThermal = () => use(ThermalContext)!

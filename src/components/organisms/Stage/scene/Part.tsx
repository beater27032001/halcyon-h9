'use client'

import { createContext, use, useEffect, useRef } from 'react'

import type { ThreeElements } from '@react-three/fiber'
import { Color, SRGBColorSpace, type MeshPhysicalMaterial } from 'three'

import { heat } from '@domain/gpu'

/** Acabamentos de estúdio: cor, metal, rugosidade e verniz. */
export const FINISH = {
  gunmetal: { color: '#2d313a', metal: 0.8, rough: 0.34, coat: 0.6 },
  brushed: { color: '#868c95', metal: 1, rough: 0.48, coat: 0 },
  aluminium: { color: '#cdd2d9', metal: 1, rough: 0.26, coat: 0 },
  steel: { color: '#b9bec6', metal: 1, rough: 0.32, coat: 0 },
  copper: { color: '#c97b46', metal: 1, rough: 0.24, coat: 0 },
  gold: { color: '#dcb55c', metal: 1, rough: 0.2, coat: 0 },
  mirror: { color: '#c8ced7', metal: 1, rough: 0.08, coat: 0 },
  plastic: { color: '#15171b', metal: 0, rough: 0.5, coat: 0.2 },
  blade: { color: '#1d2026', metal: 0.1, rough: 0.42, coat: 0.4 },
  pcb: { color: '#0e1814', metal: 0.15, rough: 0.7, coat: 0.3 },
  substrate: { color: '#1f4c36', metal: 0.1, rough: 0.55, coat: 0 },
  chip: { color: '#17191d', metal: 0.25, rough: 0.4, coat: 0 },
  choke: { color: '#45494f', metal: 0.6, rough: 0.42, coat: 0 },
  light: { color: '#ff5a1f', metal: 0, rough: 0.4, coat: 0 },
} as const

export type Finish = keyof typeof FINISH

// Cada peça registra seu material para a visão térmica misturar as duas cores.
export interface PartEntry {
  material: MeshPhysicalMaterial
  normal: Color
  thermal: Color
  glow: boolean
}
export const PartsContext = createContext<Set<PartEntry> | null>(null)

export type Vec3 = [number, number, number]

interface PartProps extends Omit<ThreeElements['mesh'], 'children'> {
  children?: React.ReactNode
  finish: Finish
  /** Temperatura relativa da peça na visão térmica, de 0 a 1. */
  temp: number
  glow?: boolean
}

export function Part({ children, finish, temp, glow, ...mesh }: PartProps) {
  const parts = use(PartsContext)!
  const material = useRef<MeshPhysicalMaterial>(null)
  const f = FINISH[finish]

  useEffect(() => {
    const entry = {
      material: material.current!,
      normal: new Color(f.color),
      thermal: new Color().setRGB(...heat(temp), SRGBColorSpace),
      glow: !!glow,
    }
    parts.add(entry)
    return () => {
      parts.delete(entry)
    }
  }, [parts, f.color, temp, glow])

  return (
    <mesh castShadow {...mesh}>
      {children}
      <meshPhysicalMaterial
        ref={material}
        color={f.color}
        metalness={f.metal}
        roughness={f.rough}
        clearcoat={f.coat}
        clearcoatRoughness={0.25}
        emissive={glow ? f.color : '#000000'}
        emissiveIntensity={glow ? 2.2 : 0}
      />
    </mesh>
  )
}

export function Box({
  size,
  ...props
}: Omit<PartProps, 'children'> & { size: Vec3 }) {
  return (
    <Part {...props}>
      <boxGeometry args={size} />
    </Part>
  )
}

export function Cylinder({
  radius,
  height,
  segments = 24,
  ...props
}: Omit<PartProps, 'children'> & {
  radius: number
  height: number
  segments?: number
}) {
  return (
    <Part {...props}>
      <cylinderGeometry args={[radius, radius, height, segments]} />
    </Part>
  )
}

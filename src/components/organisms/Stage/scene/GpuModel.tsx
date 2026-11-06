'use client'

import { useMemo } from 'react'

import type { Group } from 'three'

import { blade, plate } from './geometry'
import { Box, Cylinder, Part } from './Part'

/** Altura de cada camada montada e quanto ela se afasta ao desmontar. */
export const LAYERS = [
  { y0: -0.22, spread: -1.7 }, // backplate
  { y0: 0, spread: -0.5 }, // PCB
  { y0: 0.07, spread: 0.55 }, // chips
  { y0: 0.52, spread: 1.7 }, // dissipador
  { y0: 1.0, spread: 3.3 }, // shroud
]

const range = (n: number) => Array.from({ length: n }, (_, i) => i)
const FAN_X = [-2, 0, 2]
const FAN_RADIUS = 0.93
const VRAM: [number, number][] = [
  [-1.05, -0.55],
  [-1.05, 0],
  [-1.05, 0.55],
  [1.05, -0.55],
  [1.05, 0],
  [1.05, 0.55],
  [0, -1.0],
  [0, 1.0],
]
const FIN_X = range(61).map((i) => -2.9 + i * (5.8 / 60))
const BLADES = range(11).map((b) => (b / 11) * Math.PI * 2)
const STATOR = range(3).map((s) => (s / 3) * Math.PI * 2 + 0.4)
const PORTS_Z = [-0.85, -0.4, 0.05, 0.55]
// grade de ventilação da backplate, sobre a saída de ar das hélices
const VENTS: [number, number, number, number][] = range(9).flatMap((c) =>
  [-0.62, 0, 0.62].map((z): [number, number, number, number] => [
    1.05 + c * 0.21,
    z,
    0.08,
    0.44,
  ]),
)

type Register = (index: number, el: Group | null) => void

interface Props {
  /** Entrega cada camada e cada rotor para quem anima a cena. */
  onLayer: Register
  onFan: Register
}

export function GpuModel({ onLayer, onFan }: Props) {
  const shroud = useMemo(
    () =>
      plate({
        width: 6.25,
        depth: 2.55,
        thickness: 0.22,
        corner: 0.16,
        bevel: 0.03,
        circles: FAN_X.map((x): [number, number, number] => [
          x,
          0,
          FAN_RADIUS + 0.02,
        ]),
      }),
    [],
  )
  const backplate = useMemo(
    () =>
      plate({
        width: 6.1,
        depth: 2.45,
        thickness: 0.05,
        corner: 0.1,
        bevel: 0.012,
        slots: VENTS,
      }),
    [],
  )
  const bladeShape = useMemo(() => blade(0.27, FAN_RADIUS - 0.04), [])

  return (
    <>
      {/* backplate de alumínio escovado */}
      <group ref={(el) => onLayer(0, el)}>
        <Part geometry={backplate} finish="brushed" temp={0.38} />
        <Box
          size={[1.7, 0.012, 0.16]}
          finish="gunmetal"
          temp={0.42}
          position={[-1.5, 0.03, 0.2]}
        />
        <Box
          size={[0.9, 0.012, 0.08]}
          finish="light"
          temp={0.4}
          position={[-1.9, 0.03, -0.1]}
        />
      </group>

      {/* PCB, contatos, componentes e suporte de I/O */}
      <group ref={(el) => onLayer(1, el)}>
        <Box size={[6, 0.06, 2.4]} finish="pcb" temp={0.5} />
        {range(16).map((i) => (
          <Box
            key={i}
            size={[0.15, 0.03, 0.17]}
            finish="gold"
            temp={0.4}
            position={[-2.15 + i * 0.205, 0, 1.25]}
          />
        ))}
        {range(10).map((i) => (
          <Box
            key={i}
            size={[0.22, 0.13, 0.22]}
            finish="choke"
            temp={0.72}
            position={[
              1.6 + (i % 5) * 0.3,
              0.09,
              -0.9 + Math.floor(i / 5) * 0.3,
            ]}
          />
        ))}
        {range(10).map((i) => (
          <Cylinder
            key={i}
            radius={0.055}
            height={0.14}
            segments={16}
            finish="steel"
            temp={0.62}
            position={[
              1.6 + (i % 5) * 0.3,
              0.1,
              -0.3 + Math.floor(i / 5) * 0.15,
            ]}
          />
        ))}
        <Box
          size={[0.7, 0.22, 0.26]}
          finish="plastic"
          temp={0.55}
          position={[2.55, 0.14, -1.06]}
        />
        <Box
          size={[0.035, 1.35, 2.6]}
          finish="steel"
          temp={0.3}
          position={[-3.07, 0.55, 0]}
        />
        {PORTS_Z.map((z, i) => (
          <Box
            key={z}
            size={[0.05, 0.12, i === 3 ? 0.36 : 0.3]}
            finish="plastic"
            temp={0.32}
            position={[-3.1, 0.12, z]}
          />
        ))}
        {range(4).map((i) => (
          <Box
            key={i}
            size={[0.04, 0.05, 2.05]}
            finish="plastic"
            temp={0.28}
            position={[-3.09, 0.48 + i * 0.16, 0]}
          />
        ))}
      </group>

      {/* chip e memórias */}
      <group ref={(el) => onLayer(2, el)}>
        <Box size={[1.35, 0.04, 1.35]} finish="substrate" temp={0.85} />
        <Box
          size={[0.92, 0.08, 0.92]}
          finish="mirror"
          temp={1}
          position={[0, 0.05, 0]}
        />
        {VRAM.map(([x, z]) => (
          <Box
            key={`${x}:${z}`}
            size={[0.36, 0.06, 0.28]}
            finish="chip"
            temp={0.8}
            position={[x, 0.02, z]}
          />
        ))}
      </group>

      {/* dissipador: base de cobre, aletas de alumínio e heatpipes */}
      <group ref={(el) => onLayer(3, el)}>
        <Box
          size={[5.8, 0.06, 2.2]}
          finish="copper"
          temp={0.9}
          position={[0, -0.3, 0]}
        />
        {FIN_X.map((x) => (
          <Box
            key={x}
            size={[0.028, 0.55, 2.15]}
            finish="aluminium"
            temp={1 - Math.abs(x) / 3.4}
            position={[x, 0, 0]}
          />
        ))}
        {range(6).map((i) => (
          <Cylinder
            key={i}
            radius={0.055}
            height={5.9}
            segments={16}
            finish="copper"
            temp={0.95 - Math.abs(i - 2.5) * 0.05}
            rotation={[0, 0, Math.PI / 2]}
            position={[0, -0.18, -0.75 + i * 0.3]}
          />
        ))}
      </group>

      {/* shroud com recortes, frisos e hélices */}
      <group ref={(el) => onLayer(4, el)}>
        <Part geometry={shroud} finish="gunmetal" temp={0.22} />
        <Box
          size={[6.05, 0.05, 0.03]}
          finish="brushed"
          temp={0.26}
          position={[0, 0.05, 1.27]}
        />
        <Box
          size={[6.05, 0.035, 0.035]}
          finish="light"
          temp={0.3}
          glow
          position={[0, 0.115, 1.235]}
        />
        {FAN_X.map((x, i) => (
          <group key={x} position={[x, 0, 0]}>
            <Part
              finish="brushed"
              temp={0.26}
              rotation={[Math.PI / 2, 0, 0]}
              position={[0, 0.1, 0]}
            >
              <torusGeometry args={[FAN_RADIUS + 0.03, 0.022, 10, 64]} />
            </Part>
            {STATOR.map((a) => (
              <Box
                key={a}
                size={[FAN_RADIUS - 0.25, 0.03, 0.04]}
                finish="plastic"
                temp={0.28}
                rotation={[0, -a, 0]}
                position={[
                  Math.cos(a) * (FAN_RADIUS / 2 + 0.12),
                  -0.06,
                  Math.sin(a) * (FAN_RADIUS / 2 + 0.12),
                ]}
              />
            ))}
            <group ref={(el) => onFan(i, el)}>
              <Cylinder
                radius={0.27}
                height={0.1}
                finish="plastic"
                temp={0.34}
              />
              <Cylinder
                radius={0.17}
                height={0.02}
                segments={32}
                finish="brushed"
                temp={0.36}
                position={[0, 0.055, 0]}
              />
              {BLADES.map((angle) => (
                <group key={angle} rotation={[0, angle, 0]}>
                  <Part
                    geometry={bladeShape}
                    finish="blade"
                    temp={0.3}
                    rotation={[0.38, 0, 0]}
                  />
                </group>
              ))}
            </group>
          </group>
        ))}
      </group>
    </>
  )
}

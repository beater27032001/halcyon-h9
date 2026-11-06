'use client'

import { createContext, use, useEffect, useRef, useState } from 'react'

import { Canvas, useFrame, type ThreeElements } from '@react-three/fiber'
import { useReducedMotion, type MotionValue } from 'motion/react'
import {
  Color,
  type DirectionalLight,
  type Group,
  type MeshStandardMaterial,
} from 'three'

import { explosion, fanRpm, fanSpeed, heat } from '@domain/gpu'

export interface SceneProps {
  progress: MotionValue<number>
  rpm: MotionValue<number>
  thermal: boolean
}

// Cada peça registra seu material para a visão térmica misturar as duas cores.
interface PartEntry {
  material: MeshStandardMaterial
  normal: Color
  thermal: Color
}
const PartsContext = createContext<Set<PartEntry> | null>(null)

type Vec3 = [number, number, number]

interface PartProps extends Omit<ThreeElements['mesh'], 'children'> {
  children: React.ReactNode
  color: string
  /** Temperatura relativa da peça na visão térmica, de 0 a 1. */
  temp: number
  metal?: number
  rough?: number
  glow?: boolean
}

function Part({
  children,
  color,
  temp,
  metal = 0.4,
  rough = 0.5,
  glow,
  ...mesh
}: PartProps) {
  const parts = use(PartsContext)!
  const material = useRef<MeshStandardMaterial>(null)

  useEffect(() => {
    const entry = {
      material: material.current!,
      normal: new Color(color),
      thermal: new Color(...heat(temp)),
    }
    parts.add(entry)
    return () => {
      parts.delete(entry)
    }
  }, [parts, color, temp])

  return (
    <mesh {...mesh}>
      {children}
      <meshStandardMaterial
        ref={material}
        color={color}
        metalness={metal}
        roughness={rough}
        emissive={glow ? color : '#000000'}
        emissiveIntensity={glow ? 1.2 : 0}
      />
    </mesh>
  )
}

function Box({ size, ...props }: Omit<PartProps, 'children'> & { size: Vec3 }) {
  return (
    <Part {...props}>
      <boxGeometry args={size} />
    </Part>
  )
}

/** Altura de cada camada montada e quanto ela se afasta ao desmontar. */
const LAYERS = [
  { y0: -0.22, spread: -1.7 }, // backplate
  { y0: 0, spread: -0.5 }, // PCB
  { y0: 0.07, spread: 0.55 }, // chips
  { y0: 0.52, spread: 1.7 }, // dissipador
  { y0: 1.0, spread: 3.3 }, // shroud
]

const range = (n: number) => Array.from({ length: n }, (_, i) => i)
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
const BLADE_ANGLES = range(9).map((b) => (b / 9) * Math.PI * 2)
const KEY_LIGHT = 1.15 * Math.PI

function Gpu({ progress, rpm, thermal }: SceneProps) {
  const [parts] = useState(() => new Set<PartEntry>())
  const root = useRef<Group>(null)
  const layers = useRef<(Group | null)[]>([])
  const fans = useRef<(Group | null)[]>([])
  const key = useRef<DirectionalLight>(null)
  const anim = useRef({ mix: 0, spin: 0, px: 0, py: 0 })
  const reduced = useReducedMotion()

  useFrame(({ camera, pointer, size }, delta) => {
    const p = progress.get()
    const e = explosion(p)
    const a = anim.current

    LAYERS.forEach((l, i) => {
      layers.current[i]!.position.y = l.y0 + l.spread * e
    })

    // parallax leve com o ponteiro
    a.px += (pointer.x / 2 - a.px) * 0.05
    a.py += (-pointer.y / 2 - a.py) * 0.05
    root.current!.rotation.set(
      0.25 + Math.sin(p * Math.PI) * 0.35 + a.py * 0.2,
      -0.6 + p * 1.5 + a.px * 0.4,
      0,
    )

    // em telas estreitas a câmera recua para a placa caber inteira
    const narrow = size.width / size.height < 0.9
    const dist = (narrow ? 19 : 12.5) + e * (narrow ? 5 : 3.5)
    camera.position.set(0, dist * 0.42, dist)
    camera.lookAt(0, 0.4 + e * 0.6, 0)

    const speed = reduced ? 0 : fanSpeed(e)
    a.spin += speed * delta * 60
    fans.current.forEach((f, i) => {
      f!.rotation.y = a.spin * (i % 2 ? -1 : 1)
    })
    rpm.set(reduced ? 0 : fanRpm(speed))

    a.mix += ((thermal ? 1 : 0) - a.mix) * 0.07
    for (const part of parts)
      part.material.color.copy(part.normal).lerp(part.thermal, a.mix)
    key.current!.intensity = KEY_LIGHT * (1 - a.mix * 0.52)
  })

  return (
    <PartsContext value={parts}>
      <hemisphereLight args={['#c6d6ff', '#120806', 0.75 * Math.PI]} />
      <directionalLight ref={key} position={[4, 9, 6]} intensity={KEY_LIGHT} />
      <pointLight
        color="#ff5a1f"
        intensity={1.6 * Math.PI}
        distance={30}
        decay={1}
        position={[-7, 2, -4]}
      />
      <pointLight
        color="#6b7cff"
        intensity={0.6 * Math.PI}
        distance={30}
        decay={1}
        position={[7, -3, 5]}
      />

      <group ref={root} rotation={[0.25, -0.6, 0]}>
        {/* backplate */}
        <group
          ref={(el) => {
            layers.current[0] = el
          }}
        >
          <Box
            size={[6.1, 0.05, 2.45]}
            color="#22252c"
            temp={0.38}
            metal={0.85}
            rough={0.35}
          />
          {range(3).map((i) => (
            <Box
              key={i}
              size={[1.4, 0.06, 0.04]}
              color="#3a3f4a"
              temp={0.45}
              metal={0.9}
              rough={0.3}
              position={[-1.6 + i * 1.6, -0.01, 0.9]}
            />
          ))}
        </group>

        {/* PCB */}
        <group
          ref={(el) => {
            layers.current[1] = el
          }}
        >
          <Box
            size={[6, 0.06, 2.4]}
            color="#0b3a2c"
            temp={0.5}
            metal={0.2}
            rough={0.7}
          />
          <Box
            size={[3.2, 0.03, 0.16]}
            color="#d4a64a"
            temp={0.4}
            metal={1}
            rough={0.25}
            position={[-0.6, 0, 1.25]}
          />
          {range(10).map((i) => (
            <Box
              key={i}
              size={[0.22, 0.12, 0.22]}
              color="#1c1f24"
              temp={0.72}
              metal={0.3}
              rough={0.6}
              position={[
                1.6 + (i % 5) * 0.3,
                0.08,
                -0.9 + Math.floor(i / 5) * 0.3,
              ]}
            />
          ))}
          <Box
            size={[0.6, 0.25, 0.3]}
            color="#111111"
            temp={0.55}
            metal={0.2}
            rough={0.8}
            position={[2.6, 0.15, -0.95]}
          />
        </group>

        {/* chips */}
        <group
          ref={(el) => {
            layers.current[2] = el
          }}
        >
          <Box
            size={[1.35, 0.04, 1.35]}
            color="#1d5c3a"
            temp={0.85}
            metal={0.2}
            rough={0.6}
          />
          <Box
            size={[0.92, 0.08, 0.92]}
            color="#8e96a3"
            temp={1}
            metal={1}
            rough={0.18}
            position={[0, 0.05, 0]}
          />
          {VRAM.map(([x, z]) => (
            <Box
              key={`${x}:${z}`}
              size={[0.36, 0.06, 0.28]}
              color="#15171b"
              temp={0.8}
              metal={0.3}
              rough={0.5}
              position={[x, 0.02, z]}
            />
          ))}
        </group>

        {/* dissipador */}
        <group
          ref={(el) => {
            layers.current[3] = el
          }}
        >
          <Box
            size={[5.8, 0.06, 2.2]}
            color="#b87333"
            temp={0.9}
            metal={1}
            rough={0.3}
            position={[0, -0.3, 0]}
          />
          {FIN_X.map((x) => (
            <Box
              key={x}
              size={[0.028, 0.55, 2.15]}
              color="#a3abb8"
              temp={1 - Math.abs(x) / 3.4}
              metal={0.9}
              rough={0.32}
              position={[x, 0, 0]}
            />
          ))}
          {range(6).map((i) => (
            <Part
              key={i}
              color="#c5793a"
              temp={0.95 - Math.abs(i - 2.5) * 0.05}
              metal={1}
              rough={0.25}
              rotation={[0, 0, Math.PI / 2]}
              position={[0, -0.18, -0.75 + i * 0.3]}
            >
              <cylinderGeometry args={[0.055, 0.055, 5.9, 12]} />
            </Part>
          ))}
        </group>

        {/* shroud e hélices */}
        <group
          ref={(el) => {
            layers.current[4] = el
          }}
        >
          <Box
            size={[6.25, 0.22, 2.55]}
            color="#1a1d24"
            temp={0.22}
            metal={0.7}
            rough={0.45}
          />
          <Box
            size={[6.25, 0.04, 0.05]}
            color="#ff5a1f"
            temp={0.3}
            metal={0.2}
            glow
            position={[0, 0.06, 1.28]}
          />
          {[-2, 0, 2].map((x, i) => (
            <group key={x} position={[x, 0.14, 0]}>
              <Part
                color="#2a2e37"
                temp={0.26}
                metal={0.6}
                rough={0.4}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <torusGeometry args={[0.98, 0.05, 8, 48]} />
              </Part>
              <group
                ref={(el) => {
                  fans.current[i] = el
                }}
              >
                <Part color="#0e0f12" temp={0.34} metal={0.5}>
                  <cylinderGeometry args={[0.28, 0.28, 0.1, 24]} />
                </Part>
                {BLADE_ANGLES.map((angle) => (
                  <Box
                    key={angle}
                    size={[0.62, 0.02, 0.24]}
                    color="#0f1115"
                    temp={0.3}
                    metal={0.3}
                    rough={0.6}
                    position={[
                      Math.cos(angle) * 0.58,
                      0,
                      Math.sin(angle) * 0.58,
                    ]}
                    rotation={[0.35, -angle, 0]}
                  />
                ))}
              </group>
            </group>
          ))}
        </group>
      </group>
    </PartsContext>
  )
}

export default function GpuScene({
  onReady,
  ...scene
}: SceneProps & { onReady: () => void }) {
  return (
    <Canvas
      linear
      flat
      dpr={[1, 2]}
      camera={{ fov: 32, near: 0.1, far: 100, position: [0, 5, 12.5] }}
      gl={{ antialias: true, alpha: true }}
      onCreated={onReady}
      fallback={null}
    >
      <Gpu {...scene} />
    </Canvas>
  )
}

'use client'

import { useCallback, useRef, useState } from 'react'

import { ContactShadows, Environment, Lightformer } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useReducedMotion, type MotionValue } from 'motion/react'
import type { DirectionalLight, Group } from 'three'

import { explosion, fanRpm, fanSpeed } from '@domain/gpu'

import { GpuModel, LAYERS } from './scene/GpuModel'
import { PartsContext, type PartEntry } from './scene/Part'

export interface SceneProps {
  progress: MotionValue<number>
  rpm: MotionValue<number>
  thermal: boolean
}

const KEY_LIGHT = 2.2
const FOV = 32
/** Largura que precisa caber na tela: a placa tem 6,25 de comprimento e gira. */
const FIT_WIDTH = 7

/** Estúdio fotográfico virtual: softboxes que viram reflexos nas peças metálicas. */
function Studio() {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer
        form="rect"
        intensity={2.4}
        scale={[12, 5, 1]}
        position={[0, 7, 1]}
        rotation={[Math.PI / 2, 0, 0]}
      />
      <Lightformer
        form="rect"
        intensity={1.6}
        color="#dfe6ff"
        scale={[3, 9, 1]}
        position={[-7, 1, 3]}
        rotation={[0, Math.PI / 2, 0]}
      />
      <Lightformer
        form="rect"
        intensity={0.55}
        color="#ff9a70"
        scale={[3, 9, 1]}
        position={[7, 1, -3]}
        rotation={[0, -Math.PI / 2, 0]}
      />
      <Lightformer form="ring" intensity={0.8} scale={5} position={[0, 2, 9]} />
    </Environment>
  )
}

function Gpu({ progress, rpm, thermal }: SceneProps) {
  const [parts] = useState(() => new Set<PartEntry>())
  const root = useRef<Group>(null)
  const layers = useRef<(Group | null)[]>([])
  const fans = useRef<(Group | null)[]>([])
  const key = useRef<DirectionalLight>(null)
  const anim = useRef({ mix: 0, spin: 0, px: 0, py: 0 })
  const reduced = useReducedMotion()
  const onLayer = useCallback((i: number, el: Group | null) => {
    layers.current[i] = el
  }, [])
  const onFan = useCallback((i: number, el: Group | null) => {
    fans.current[i] = el
  }, [])

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

    // a câmera recua o quanto precisar para a placa caber na largura da tela
    const aspect = size.width / size.height
    const fit = FIT_WIDTH / (2 * Math.tan(((FOV / 2) * Math.PI) / 180) * aspect)
    const dist = Math.max(12.5, fit) + e * 3.5
    camera.position.set(0, dist * 0.42, dist)
    camera.lookAt(0, 0.4 + e * 0.6, 0)

    const speed = reduced ? 0 : fanSpeed(e)
    a.spin += speed * delta * 60
    fans.current.forEach((f, i) => {
      f!.rotation.y = a.spin * (i % 2 ? -1 : 1)
    })
    rpm.set(reduced ? 0 : fanRpm(speed))

    a.mix += ((thermal ? 1 : 0) - a.mix) * 0.07
    // visão térmica como câmera térmica: cada peça emite a própria cor e o reflexo do estúdio some
    for (const part of parts) {
      const m = part.material
      m.color.copy(part.normal).lerp(part.thermal, a.mix)
      m.setValues({ envMapIntensity: 1 - a.mix * 0.85 })
      if (part.glow) continue
      m.emissive.copy(part.thermal)
      m.setValues({ emissiveIntensity: a.mix * 0.9 })
    }
    key.current!.intensity = KEY_LIGHT * (1 - a.mix * 0.5)
  })

  return (
    <PartsContext value={parts}>
      <Studio />
      <hemisphereLight args={['#c6d6ff', '#1a0d08', 0.6]} />
      <directionalLight ref={key} position={[4, 9, 6]} intensity={KEY_LIGHT} />
      <pointLight
        color="#ff5a1f"
        intensity={8}
        distance={30}
        position={[-7, 2, -4]}
      />
      <group ref={root} rotation={[0.25, -0.6, 0]}>
        <GpuModel onLayer={onLayer} onFan={onFan} />
      </group>
      <ContactShadows
        position={[0, -2.6, 0]}
        scale={16}
        blur={2.6}
        far={6}
        opacity={0.6}
        resolution={512}
        color="#000000"
      />
    </PartsContext>
  )
}

export default function GpuScene({
  onReady,
  ...scene
}: SceneProps & { onReady: () => void }) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ fov: FOV, near: 0.1, far: 100, position: [0, 5, 12.5] }}
      gl={{ antialias: true, alpha: true }}
      onCreated={onReady}
      fallback={null}
    >
      <Gpu {...scene} />
    </Canvas>
  )
}

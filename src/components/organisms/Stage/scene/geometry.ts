import { ExtrudeGeometry, Path, Shape } from 'three'

/** Retângulo de cantos arredondados centrado em (cx, cy). */
function roundedRect<T extends Path>(
  path: T,
  cx: number,
  cy: number,
  w: number,
  h: number,
  r: number,
) {
  const x = cx - w / 2,
    y = cy - h / 2
  path.moveTo(x + r, y)
  path.lineTo(x + w - r, y)
  path.quadraticCurveTo(x + w, y, x + w, y + r)
  path.lineTo(x + w, y + h - r)
  path.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  path.lineTo(x + r, y + h)
  path.quadraticCurveTo(x, y + h, x, y + h - r)
  path.lineTo(x, y + r)
  path.quadraticCurveTo(x, y, x + r, y)
  return path
}

interface PlateOptions {
  width: number
  depth: number
  thickness: number
  corner: number
  bevel?: number
  /** Furos circulares: [x, z, raio]. */
  circles?: [number, number, number][]
  /** Fendas retangulares: [x, z, largura, profundidade]. */
  slots?: [number, number, number, number][]
}

/** Chapa deitada no plano XZ, com furos e bordas chanfradas. */
export function plate({
  width,
  depth,
  thickness,
  corner,
  bevel = 0.02,
  circles = [],
  slots = [],
}: PlateOptions) {
  // o three.js corrige sozinho o sentido dos furos ao extrudar
  const shape = roundedRect(new Shape(), 0, 0, width, depth, corner)
  for (const [x, z, r] of circles) {
    const hole = new Path()
    hole.absarc(x, -z, r, 0, Math.PI * 2, true)
    shape.holes.push(hole)
  }
  for (const [x, z, w, d] of slots) {
    shape.holes.push(roundedRect(new Path(), x, -z, w, d, Math.min(w, d) / 2))
  }
  const geometry = new ExtrudeGeometry(shape, {
    depth: thickness - bevel * 2,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 48,
  })
  geometry.rotateX(-Math.PI / 2)
  geometry.translate(0, -thickness / 2 + bevel, 0)
  geometry.computeVertexNormals()
  return geometry
}

/** Pá de hélice curva, da raiz (perto do cubo) até a ponta. */
export function blade(root: number, tip: number) {
  const s = new Shape()
  s.moveTo(root, -0.05)
  s.quadraticCurveTo((root + tip) / 2, -0.2, tip, -0.06)
  s.quadraticCurveTo(tip + 0.04, 0.1, tip - 0.04, 0.2)
  s.quadraticCurveTo((root + tip) / 2, 0.14, root, 0.07)
  s.lineTo(root, -0.05)
  const geometry = new ExtrudeGeometry(s, {
    depth: 0.014,
    bevelEnabled: false,
    curveSegments: 16,
  })
  geometry.rotateX(-Math.PI / 2)
  return geometry
}

export interface Chapter {
  kicker: string
  title: string
  text: string
}

export const CHAPTERS: Chapter[] = [
  {
    kicker: 'Placa de vídeo · série 9',
    title: 'Halcyon H9',
    text: 'Role a página. A placa se desmonta camada por camada até o chip.',
  },
  {
    kicker: '01 · Shroud',
    title: 'Três hélices, 110 mm',
    text: 'Fluxo axial com pás de borda serrilhada. Paradas em uso leve abaixo de 55 °C.',
  },
  {
    kicker: '02 · Dissipador',
    title: '61 aletas, 6 heatpipes',
    text: 'Câmara de vapor sobre o die e heatpipes de cobre de 8 mm até as bordas.',
  },
  {
    kicker: '03 · Silício',
    title: 'Die de 4 nm, 24 GB',
    text: 'Oito chips GDDR7 ao redor do processador, em barramento de 384 bits.',
  },
  {
    kicker: '04 · Backplate',
    title: 'Alumínio que também resfria',
    text: 'Pads térmicos na traseira das VRAMs transferem calor para a chapa.',
  },
]

const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v))

/** Capítulo ativo para um progresso de scroll de 0 a 1. */
export const chapterAt = (progress: number) =>
  Math.min(
    CHAPTERS.length - 1,
    Math.floor(clamp(progress) * CHAPTERS.length * 0.999),
  )

/** A placa esquenta conforme você desce até o chip. */
export const temperatures = (progress: number) => ({
  die: Math.round(41 + clamp(progress) * 36),
  vram: Math.round(38 + clamp(progress) * 28),
})

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2

/** Quanto as camadas já se afastaram (0 montada, 1 desmontada): começa em 12% do scroll e termina em 74%. */
export const explosion = (progress: number) =>
  easeInOutCubic(clamp((progress - 0.12) / 0.62))

/** Velocidade das hélices: giram rápido montadas e desaceleram ao desmontar. */
export const fanSpeed = (explosionAmount: number) =>
  0.06 + (1 - explosionAmount) * 0.22
export const fanRpm = (speed: number) => Math.round(800 + speed * 9000)

export type Rgb = [number, number, number]

/** Paleta da visão térmica, do frio ao quente. */
export const HEAT_STOPS = ['#2a0f5c', '#9d1aa0', '#ff5a1f', '#ffd23f']

const hexToRgb = (hex: string): Rgb => {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}
const STOPS = HEAT_STOPS.map(hexToRgb)

/** Cor de uma temperatura relativa (0 frio, 1 quente), em RGB de 0 a 1. */
export function heat(t: number): Rgb {
  const x = clamp(t) * (STOPS.length - 1)
  const i = Math.min(STOPS.length - 2, Math.floor(x))
  const f = x - i
  const [a, b] = [STOPS[i], STOPS[i + 1]]
  return [
    a[0] + (b[0] - a[0]) * f,
    a[1] + (b[1] - a[1]) * f,
    a[2] + (b[2] - a[2]) * f,
  ]
}

export interface Spec {
  value: number
  decimals?: number
  unit?: string
  label: string
}

export const SPECS: Spec[] = [
  { value: 21760, label: 'Núcleos de shader' },
  { value: 24, unit: 'GB', label: 'Memória GDDR7' },
  { value: 2.91, decimals: 2, unit: 'GHz', label: 'Clock boost' },
  { value: 384, unit: 'bits', label: 'Barramento' },
  { value: 450, unit: 'W', label: 'Potência total' },
  { value: 3.2, decimals: 1, unit: 'slots', label: 'Espessura' },
]

export const formatSpec = (value: number, decimals = 0) =>
  value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

export interface Benchmark {
  name: string
  h9: number
  h7: number
}

export const BENCHMARKS: Benchmark[] = [
  { name: 'Path tracing · 4K', h9: 142, h7: 88 },
  { name: 'Rasterização · 1440p', h9: 311, h7: 214 },
  { name: 'Render de IA · it/s', h9: 64, h7: 31 },
  { name: 'Ray tracing · 4K + upscaling', h9: 198, h7: 121 },
]

export const gain = ({ h9, h7 }: Benchmark) => Math.round((h9 / h7 - 1) * 100)

export const PRICE = 11499

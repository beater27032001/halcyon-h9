// Gera os prints do README: npm run build && npm run screenshots
import { spawn } from 'node:child_process'

import { chromium, type Page } from 'playwright'

interface Shot {
  name: string
  width: number
  height: number
  /** Prepara a página antes do print (rolar, clicar). */
  setup?: (page: Page) => Promise<void>
}

/** Rola até uma fração do palco 3D (0 capa, 1 fim da desmontagem). */
const stage = (fraction: number) => async (page: Page) => {
  await page.evaluate((f) => {
    const el = document.querySelector<HTMLElement>('[data-stage]')!
    window.scrollTo(0, el.offsetTop + f * (el.clientHeight - innerHeight))
  }, fraction)
}
const section = (selector: string) => async (page: Page) => {
  await page.locator(selector).scrollIntoViewIfNeeded()
}
const thermal = async (page: Page) => {
  await page.click('nav button')
}

const SHOTS: Shot[] = [
  { name: 'desktop', width: 1440, height: 900 },
  {
    name: 'desktop-thermal',
    width: 1440,
    height: 900,
    setup: async (p) => {
      await stage(0.62)(p)
      await thermal(p)
    },
  },
  {
    name: 'desktop-specs',
    width: 1440,
    height: 900,
    setup: section('[data-section="specs"]'),
  },
  { name: 'tablet', width: 820, height: 1180, setup: stage(0.3) },
  { name: 'mobile', width: 390, height: 844 },
  {
    name: 'mobile-thermal',
    width: 390,
    height: 844,
    setup: async (p) => {
      await stage(0.62)(p)
      await thermal(p)
    },
  },
]

const server = spawn('node_modules/.bin/next', ['start', '-p', '4173'])
await new Promise((resolve, reject) => {
  server.stdout.on('data', (d) => String(d).includes('Ready') && resolve(null))
  server.on('exit', (code) => reject(new Error(`next start saiu com ${code}`)))
})
// WebGL por software, para funcionar sem GPU
const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
})
const errors: string[] = []

for (const shot of SHOTS) {
  const page = await browser.newPage({
    viewport: { width: shot.width, height: shot.height },
    deviceScaleFactor: 2,
  })
  page.on('pageerror', (e) => errors.push(`${shot.name}: ${e.message}`))
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)
  if (shot.setup) {
    await shot.setup(page)
    await page.waitForTimeout(2200)
  }
  await page.screenshot({ path: `docs/${shot.name}.png` })
  await page.close()
}

await browser.close()
server.kill()
if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log('prints salvos em docs/')

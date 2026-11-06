// Rode com: npm run check
import assert from 'node:assert/strict'

import {
  chapterAt,
  explosion,
  formatSpec,
  gain,
  heat,
  HEAT_STOPS,
  temperatures,
} from './gpu.ts'

assert.equal(chapterAt(0), 0)
assert.equal(chapterAt(1), 4, 'fim do scroll fica no último capítulo')
assert.equal(chapterAt(0.5), 2)
assert.equal(explosion(0.05), 0, 'montada antes de 12%')
assert.equal(explosion(0.9), 1, 'desmontada depois de 74%')
assert.deepEqual(temperatures(0), { die: 41, vram: 38 })
assert.deepEqual(temperatures(1), { die: 77, vram: 66 })
const hex = (c: number[]) =>
  '#' +
  c
    .map((v) =>
      Math.round(v * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')
assert.equal(hex(heat(0)), HEAT_STOPS[0])
assert.equal(hex(heat(1)), HEAT_STOPS[3])
assert.equal(formatSpec(21760), '21.760')
assert.equal(formatSpec(2.91, 2), '2,91')
assert.equal(gain({ name: '', h9: 64, h7: 31 }), 106)
console.log('gpu ok')

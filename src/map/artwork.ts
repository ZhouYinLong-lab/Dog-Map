import type { ArtworkSpec } from '../types/content'

const palette = {
  red: '#e6333b',
  teal: '#17c8c0',
  yellow: '#f0c94b',
  paper: '#f2eadc',
  ink: '#111111',
}

function hashSeed(seed: string) {
  return [...seed].reduce((value, character) => ((value << 5) - value + character.charCodeAt(0)) | 0, 17)
}

function random(seed: number) {
  let value = Math.abs(seed) || 1
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296
    return value / 4294967296
  }
}

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[character] ?? character)
}

export function artworkDataUri(seed: string, color: 'red' | 'teal' | 'yellow', spec?: ArtworkSpec) {
  const source = hashSeed(`${seed}:${spec?.seed ?? ''}`)
  const next = random(source)
  const variant = spec?.variant ?? (['burst', 'slash', 'orbit'] as const)[Math.floor(next() * 3)]
  const accent = palette[color === 'teal' ? 'teal' : color]
  const secondary = color === 'red' ? palette.yellow : palette.red
  const rotation = Math.round(next() * 20 - 10)
  const points = Array.from({ length: 9 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / 9 - Math.PI / 2
    const radius = 36 + next() * 19
    return `${50 + Math.cos(angle) * radius},${50 + Math.sin(angle) * radius}`
  }).join(' ')
  const slash = `${18 + next() * 12} ${76 - next() * 10} ${76 + next() * 12} ${22 + next() * 10}`
  const label = escapeXml(seed.replace(/[-_]/g, ' ').toUpperCase())
  const motif = variant === 'burst'
    ? `<polygon points="${points}" fill="${accent}"/><path d="M15 69L83 25" stroke="${palette.paper}" stroke-width="3"/><circle cx="50" cy="50" r="9" fill="${palette.ink}" stroke="${palette.paper}" stroke-width="3"/>`
    : variant === 'slash'
      ? `<path d="M${slash}" stroke="${accent}" stroke-width="24"/><path d="M18 76L84 24" stroke="${palette.ink}" stroke-width="9"/><path d="M25 70L91 18" stroke="${palette.paper}" stroke-width="3"/>`
      : `<circle cx="50" cy="50" r="35" fill="none" stroke="${accent}" stroke-width="13" stroke-dasharray="22 12"/><circle cx="50" cy="50" r="18" fill="${secondary}"/><path d="M16 78L84 20" stroke="${palette.ink}" stroke-width="8"/>`

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="${label} visual pattern"><g transform="rotate(${rotation} 50 50)" stroke-linejoin="round"><path d="M8 14L91 7L96 88L17 96Z" fill="${palette.ink}" opacity=".92" transform="translate(5 5)"/>${motif}<path d="M9 14L92 8L95 88L16 95Z" fill="none" stroke="${palette.paper}" stroke-width="2" stroke-dasharray="3 4"/></g></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

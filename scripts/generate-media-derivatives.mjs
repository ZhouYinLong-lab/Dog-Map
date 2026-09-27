import { existsSync } from 'node:fs'
import { dirname, extname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import places from '../src/data/places.json' with { type: 'json' }

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const mediaRoot = resolve(root, 'public', 'media')
const derivatives = new Map()

function addDerivative(url, kind) {
  if (typeof url !== 'string' || !url.startsWith('/media/')) return
  const pathname = new URL(url, 'https://dog-map.invalid').pathname
  const source = resolve(root, 'public', decodeURIComponent(pathname.slice(1)))
  if (!source.startsWith(`${mediaRoot}${sep}`)) throw new Error(`Media path escapes public/media: ${url}`)
  if (extname(source).toLowerCase() !== '.webp' || !existsSync(source)) return

  const target = kind === 'marker'
    ? source.replace(/\.webp$/i, '.marker.webp')
    : source.replace(/\.webp$/i, '.thumb.webp')
  derivatives.set(target, { source, kind })
}

for (const place of places) {
  addDerivative(place.markerImage, 'marker')
  for (const item of place.media ?? []) {
    if (item.type === 'image') addDerivative(item.src, 'thumbnail')
    if (item.type === 'video') addDerivative(item.poster, 'thumbnail')
  }
  for (const shop of place.shops ?? []) {
    for (const item of shop.media ?? []) {
      if (item.type === 'image') addDerivative(item.src, 'thumbnail')
      if (item.type === 'video') addDerivative(item.poster, 'thumbnail')
    }
  }
}

let created = 0
for (const [target, { source, kind }] of derivatives) {
  const maxSize = kind === 'marker' ? '512x512>' : '960x960>'
  const quality = kind === 'marker' ? '84' : '80'
  execFileSync('magick', [
    source,
    '-auto-orient',
    '-resize', maxSize,
    '-strip',
    '-define', 'webp:method=6',
    '-quality', quality,
    target,
  ], { stdio: 'inherit' })
  created += 1
}

process.stdout.write(`Generated ${created} media derivatives (960px thumbnails and 512px map markers).\n`)

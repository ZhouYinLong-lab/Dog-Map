import { existsSync, readFileSync } from 'node:fs'
import { dirname, extname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const mediaRoot = resolve(root, 'public', 'media')
const places = JSON.parse(readFileSync(resolve(root, 'src/data/places.json'), 'utf8'))
const required = new Set()

function requireDerivative(url, kind) {
  if (typeof url !== 'string' || !url.startsWith('/media/')) return
  const pathname = new URL(url, 'https://dog-map.invalid').pathname
  const source = resolve(root, 'public', decodeURIComponent(pathname.slice(1)))
  if (!source.startsWith(`${mediaRoot}${sep}`) || extname(source).toLowerCase() !== '.webp') return

  required.add(kind === 'marker'
    ? source.replace(/\.webp$/i, '.marker.webp')
    : source.replace(/\.webp$/i, '.thumb.webp'))
}

for (const place of places) {
  requireDerivative(place.markerImage, 'marker')
  for (const item of [...(place.media ?? []), ...(place.shops ?? []).flatMap((shop) => shop.media ?? [])]) {
    if (item.type === 'image') requireDerivative(item.src, 'thumbnail')
    if (item.type === 'video') requireDerivative(item.poster, 'thumbnail')
  }
}

const missing = [...required].filter((path) => !existsSync(path))
if (missing.length > 0) {
  process.stderr.write(`Missing ${missing.length} media derivatives. Run npm run assets:derive.\n${missing.join('\n')}\n`)
  process.exitCode = 1
} else {
  process.stdout.write(`Validated ${required.size} media derivatives.\n`)
}

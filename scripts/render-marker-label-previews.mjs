import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputDirectory = resolve(process.argv[2] ?? join(root, '.tmp-marker-labels'))
const places = JSON.parse(readFileSync(join(root, 'src/data/places.json'), 'utf8'))

const labelTopByPlace = {
  'nju-suzhou-campus': 0.71,
  'nju-gulou-campus': 0.73,
  'dongzhu-night-market': 0.73,
  'zhuozheng-garden': 0.71,
  'shizilin-garden': 0.72,
  'liuyuan-garden': 0.73,
  'suzhou-mixc-world': 0.73,
  'wanfo-temple': 0.65,
  'taihu-lakeshore': 0.68,
  'xuanwu-lake': 0.68,
}
const labelPatchByPlace = {
  'wanfo-temple': [[0.22, 0.69], [0.78, 0.69], [0.94, 0.78], [0.85, 0.92], [0.15, 0.93], [0.06, 0.80]],
  'taihu-lakeshore': [[0.25, 0.72], [0.76, 0.72], [0.93, 0.81], [0.85, 0.95], [0.15, 0.96], [0.07, 0.83]],
}

function svgForPlace(place, width, height) {
  const top = labelTopByPlace[place.id] ?? 0.72
  const panelHeight = 0.97 - top
  const centerX = width / 2
  const titleBaseline = height * (top + panelHeight * 0.55)
  const englishBaseline = height * (top + panelHeight * 0.80)
  const englishTitle = place.englishTitle ?? place.id.toUpperCase()
  const englishSize = Math.min(height * panelHeight * 0.12, width * 0.70 / englishTitle.length)
  const safeTitle = place.title.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  const safeEnglish = englishTitle.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  const normalizedPatch = labelPatchByPlace[place.id] ?? [
    [0.18, top + panelHeight * 0.12],
    [0.86, top + panelHeight * 0.08],
    [0.83, top + panelHeight * 0.92],
    [0.15, top + panelHeight * 0.96],
  ]
  const patchPoints = normalizedPatch
    .map(([x, y]) => `${(width * x).toFixed(1)},${(height * y).toFixed(1)}`)
    .join(' ')
  const titleSize = Math.min(height * panelHeight * 0.40, width * 0.74 / [...place.title].length)
  const titleWidth = Math.min(width * 0.74, titleSize * [...place.title].length * 1.02)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <polygon points="${patchPoints}" fill="#050505"/>
    <g transform="rotate(-7 ${centerX.toFixed(1)} ${titleBaseline.toFixed(1)})">
      <text x="${centerX.toFixed(1)}" y="${titleBaseline.toFixed(1)}" text-anchor="middle" fill="#fff" stroke="#fff" stroke-width="${(width * 0.004).toFixed(1)}" paint-order="stroke fill" font-family="Microsoft YaHei Bold" font-size="${titleSize.toFixed(1)}" font-weight="900" font-style="italic" letter-spacing="${(width * 0.002).toFixed(1)}" textLength="${titleWidth.toFixed(1)}" lengthAdjust="spacingAndGlyphs">${safeTitle}</text>
      <text x="${centerX.toFixed(1)}" y="${englishBaseline.toFixed(1)}" text-anchor="middle" fill="#fff" font-family="Impact" font-size="${englishSize.toFixed(1)}" font-weight="900" font-style="italic" letter-spacing="${Math.max(1, width * 0.006).toFixed(1)}" textLength="${(width * 0.66).toFixed(1)}" lengthAdjust="spacingAndGlyphs">${safeEnglish}</text>
    </g>
  </svg>`
}

mkdirSync(outputDirectory, { recursive: true })
for (const place of places.filter((item) => item.id !== 'taihu-cycling-park')) {
  const sourcePath = place.id === 'nju-suzhou-campus'
    ? '/media/nanjing-university-suzhou-campus.webp'
    : place.markerImage.replace(/-sticker(?:-v\d+)?\.webp$/, '-sticker.webp')
  const source = join(root, 'public', sourcePath.replace(/^\//, ''))
  const target = join(outputDirectory, `${place.id}-sticker-v3.webp`)
  const identify = execFileSync('magick', ['identify', '-format', '%w %h', source], { encoding: 'utf8' })
  const [width, height] = identify.split(' ').map(Number)
  const svg = svgForPlace(place, width, height)
  const overlay = join(outputDirectory, `${place.id}-label.svg`)
  const overlayImage = join(outputDirectory, `${place.id}-label.png`)
  writeFileSync(overlay, svg)
  execFileSync('magick', ['-background', 'none', overlay, overlayImage])
  execFileSync('magick', ['composite', overlayImage, source, '-quality', '94', target])
  process.stdout.write(`${place.id}: ${target}\n`)
}

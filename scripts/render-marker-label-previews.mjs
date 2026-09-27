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
  'taihu-cycling-park': 0.69,
  'taihu-lakeshore': 0.72,
  'xuanwu-lake': 0.68,
}
const titleLinesByPlace = {
  'nju-suzhou-campus': ['南京大学', '苏州校区'],
  'nju-gulou-campus': ['南京大学', '鼓楼校区'],
  'dongzhu-night-market': ['东渚夜市', '与街道'],
  'taihu-cycling-park': ['苏州环太湖自行车', '运动公园'],
}

function svgForPlace(place, width, height) {
  const top = labelTopByPlace[place.id] ?? 0.72
  const panelHeight = 0.97 - top
  const centerX = width / 2
  const titleLines = titleLinesByPlace[place.id] ?? [place.title]
  const firstTitleBaseline = height * (top + panelHeight * (titleLines.length === 1 ? 0.53 : 0.30))
  const titleLineGap = height * panelHeight * 0.27
  const englishBaseline = height * (top + panelHeight * 0.78)
  const englishTitle = place.englishTitle ?? place.id.toUpperCase()
  const englishSize = Math.min(height * panelHeight * 0.14, width * 0.90 / englishTitle.length)
  const left = width * 0.065
  const right = width * 0.96
  const topY = height * top
  const bottomY = height * 0.975
  const points = [
    [left + width * 0.035, topY + height * panelHeight * 0.18],
    [right, topY],
    [right - width * 0.035, bottomY - height * panelHeight * 0.12],
    [left, bottomY],
  ].map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const insetPoints = [
    [left + width * 0.055, topY + height * panelHeight * 0.25],
    [right - width * 0.025, topY + height * panelHeight * 0.07],
    [right - width * 0.06, bottomY - height * panelHeight * 0.20],
    [left + width * 0.025, bottomY - height * panelHeight * 0.06],
  ].map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const titleTexts = titleLines.map((line, index) => {
    const safeTitle = line.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    const baseline = firstTitleBaseline + titleLineGap * index
    const titleSize = Math.min(height * panelHeight * (titleLines.length === 1 ? 0.50 : 0.25), width * 0.86 / line.length)
    return `<text x="${centerX.toFixed(1)}" y="${baseline.toFixed(1)}" text-anchor="middle" fill="#fff" stroke="#fff" stroke-width="${(width * 0.005).toFixed(1)}" paint-order="stroke fill" font-family="Microsoft YaHei Bold" font-size="${titleSize.toFixed(1)}" font-weight="900" font-style="italic" letter-spacing="${(width * 0.002).toFixed(1)}">${safeTitle}</text>`
  }).join('\n')
  const safeEnglish = englishTitle.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <polygon points="${points}" fill="#050505" stroke="#fff" stroke-width="${Math.max(5, width * 0.012).toFixed(1)}" stroke-linejoin="miter"/>
    <polygon points="${insetPoints}" fill="none" stroke="#fff" stroke-width="${Math.max(1.5, width * 0.003).toFixed(1)}" stroke-linejoin="miter" opacity=".94"/>
    <g transform="rotate(-7 ${centerX.toFixed(1)} ${firstTitleBaseline.toFixed(1)})">
      ${titleTexts}
      <text x="${centerX.toFixed(1)}" y="${englishBaseline.toFixed(1)}" text-anchor="middle" fill="#fff" font-family="Impact" font-size="${englishSize.toFixed(1)}" font-weight="900" font-style="italic" letter-spacing="${Math.max(1, width * 0.006).toFixed(1)}" textLength="${(width * 0.78).toFixed(1)}" lengthAdjust="spacingAndGlyphs">${safeEnglish}</text>
    </g>
  </svg>`
}

mkdirSync(outputDirectory, { recursive: true })
for (const place of places.filter((item) => item.id !== 'wanfo-temple')) {
  const sourcePath = place.id === 'nju-suzhou-campus'
    ? '/media/nanjing-university-suzhou-campus.webp'
    : place.markerImage.replace('-v2.webp', '.webp')
  const source = join(root, 'public', sourcePath.replace(/^\//, ''))
  const target = join(outputDirectory, `${place.id}-sticker-v2.webp`)
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

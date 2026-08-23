import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve('public/p5r-map-icons')

const icons = [
  ['transport', 'station', 'station', 'Station'],
  ['transport', 'train', 'train', 'Train'],
  ['transport', 'bus', 'bus', 'Bus'],
  ['transport', 'destination', 'destination', 'Destination'],
  ['locations', 'school', 'school', 'School'],
  ['locations', 'home', 'home', 'Home'],
  ['locations', 'park', 'park', 'Park'],
  ['locations', 'shrine', 'shrine', 'Shrine'],
  ['locations', 'museum', 'museum', 'Museum'],
  ['locations', 'palace', 'palace', 'Palace'],
  ['services', 'cafe', 'cafe', 'Cafe'],
  ['services', 'restaurant', 'restaurant', 'Restaurant'],
  ['services', 'shop', 'shop', 'Shop'],
  ['services', 'convenience-store', 'convenience', 'Convenience store'],
  ['services', 'bookstore', 'bookstore', 'Bookstore'],
  ['services', 'cinema', 'cinema', 'Cinema'],
  ['services', 'arcade', 'arcade', 'Arcade'],
  ['services', 'gym', 'gym', 'Gym'],
  ['services', 'clinic', 'clinic', 'Clinic'],
  ['objectives', 'memory', 'memory', 'Memory'],
]

const accentByGroup = {
  transport: '#f0c94b',
  locations: '#e6333b',
  services: '#17c8c0',
  objectives: '#f0c94b',
}

function glyph(kind, accent) {
  const stroke = '#f2eadc'
  const ink = '#111111'
  const common = `fill="none" stroke="${stroke}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"`
  switch (kind) {
    case 'station': return `<circle cx="128" cy="128" r="54" fill="${accent}"/><path d="M100 166V94l28-28 28 28v72M100 128h56" ${common}/>`
    case 'train': return `<rect x="77" y="68" width="102" height="112" rx="20" fill="${accent}"/><path d="M98 102h60M97 137h62M97 180l-18 22M159 180l18 22" ${common}/><circle cx="105" cy="163" r="7" fill="${ink}"/><circle cx="151" cy="163" r="7" fill="${ink}"/>`
    case 'bus': return `<rect x="68" y="72" width="120" height="102" rx="20" fill="${accent}"/><path d="M86 108h84M86 139h84M96 174l-15 24M160 174l15 24" ${common}/><circle cx="101" cy="155" r="8" fill="${ink}"/><circle cx="155" cy="155" r="8" fill="${ink}"/>`
    case 'destination': return `<path d="M128 42l78 86-78 86-78-86z" fill="${accent}"/><path d="M128 91l37 37-37 37-37-37z" fill="${ink}" stroke="${stroke}" stroke-width="6"/>`
    case 'school': return `<path d="M56 108l72-54 72 54-72 54z" fill="${accent}"/><path d="M79 117v67h98v-67M101 184v-46h54v46M128 54v-20" ${common}/>`
    case 'home': return `<path d="M57 121l71-65 71 65v70H57z" fill="${accent}"/><path d="M106 191v-54h44v54M55 121l73-67 73 67" ${common}/>`
    case 'park': return `<path d="M128 48c-37 0-51 38-33 60-34 4-42 54 2 62h62c44-8 36-58 2-62 18-22 4-60-33-60z" fill="${accent}"/><path d="M128 168v42M91 210h74" ${common}/>`
    case 'shrine': return `<path d="M64 80h128M75 80v35M181 80v35M53 116h150M67 116v82M189 116v82M52 198h152" ${common}/><path d="M83 65l45-29 45 29" fill="${accent}" stroke="${stroke}" stroke-width="7"/>`
    case 'museum': return `<path d="M55 84l73-42 73 42z" fill="${accent}"/><path d="M69 92v86M101 92v86M155 92v86M187 92v86M53 190h150" ${common}/>`
    case 'palace': return `<path d="M128 43l77 50-29 87H80l-29-87z" fill="${accent}"/><path d="M98 116c9-20 22-20 30 0 8-20 21-20 30 0v43H98zM114 159v-25h28v25" ${common}/>`
    case 'cafe': return `<path d="M73 84h93v55c0 33-20 53-47 53s-46-20-46-53z" fill="${accent}"/><path d="M166 99h20c25 0 25 40 0 40h-20M95 54c-15 13 15 19 0 32M130 54c-15 13 15 19 0 32" ${common}/>`
    case 'restaurant': return `<path d="M69 74v73M93 74v73M81 74v73M69 147h24M81 147v54M169 74v127M169 74c-28 27-26 60 0 71" ${common}/><circle cx="128" cy="132" r="25" fill="${accent}"/>`
    case 'shop': return `<path d="M64 100h128v92H64z" fill="${accent}"/><path d="M53 100l14-43h126l14 43zM73 100v92M183 100v92M53 192h150" ${common}/><path d="M74 79h108" ${common}/>`
    case 'convenience': return `<rect x="59" y="59" width="138" height="138" rx="18" fill="${accent}"/><path d="M128 83v90M83 128h90" stroke="${ink}" stroke-width="20" stroke-linecap="round"/><path d="M128 83v90M83 128h90" stroke="${stroke}" stroke-width="6" stroke-linecap="round"/>`
    case 'bookstore': return `<path d="M65 68h56c14 0 26 12 26 26v101H91c-14 0-26-12-26-26z" fill="${accent}"/><path d="M191 68h-44c-14 0-26 12-26 26v101h44c14 0 26-12 26-26zM91 112h43M91 145h43" ${common}/>`
    case 'cinema': return `<path d="M62 79h132v98H62z" fill="${accent}"/><path d="M62 79l20-30M95 79l20-30M128 79l20-30M161 79l20-30" ${common}/><path d="M112 108l39 20-39 20z" fill="${ink}" stroke="${stroke}" stroke-width="5"/>`
    case 'arcade': return `<path d="M72 71h112l19 117H53z" fill="${accent}"/><path d="M89 116v47M73 140h32M89 124v32M151 130h1M174 130h1M151 153h1M174 153h1" ${common}/>`
    case 'gym': return `<path d="M69 105v46M87 91v74M101 111h54M169 91v74M187 105v46" ${common}/><path d="M58 116v24M198 116v24" ${common}/><circle cx="128" cy="128" r="29" fill="${accent}"/>`
    case 'clinic': return `<circle cx="128" cy="128" r="69" fill="${accent}"/><path d="M128 84v88M84 128h88" stroke="${ink}" stroke-width="24" stroke-linecap="round"/><path d="M128 84v88M84 128h88" stroke="${stroke}" stroke-width="6" stroke-linecap="round"/>`
    case 'memory': return `<path d="M68 83l60-31 60 31v90l-60 31-60-31z" fill="${accent}"/><path d="M92 107h72v49H92zM109 107l19-20 19 20M110 130h36M110 145h24" ${common}/>`
    default: return `<circle cx="128" cy="128" r="45" fill="${accent}"/>`
  }
}

function svgFor(kind, label, accent) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><g stroke-linejoin="round"><path d="M25 35L218 22L234 215L38 232Z" fill="#111111"/><path d="M25 35L218 22L234 215L38 232Z" fill="none" stroke="#f2eadc" stroke-width="5" stroke-dasharray="8 9"/>${glyph(kind, accent)}</g><title>${label}</title></svg>`
}

await Promise.all([...new Set(icons.map(([group]) => group))].map((group) => mkdir(path.join(root, group), { recursive: true })))
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 256, height: 256 }, deviceScaleFactor: 1 })
const manifest = []

for (const [group, file, kind, label] of icons) {
  await page.setContent(svgFor(kind, label, accentByGroup[group]))
  const output = path.join(root, group, `${file}.png`)
  await page.screenshot({ path: output, omitBackground: true })
  manifest.push({ id: file, group, label, path: `/p5r-map-icons/${group}/${file}.png`, style: 'original-p5r-inspired' })
}

await browser.close()
await writeFile(path.join(root, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

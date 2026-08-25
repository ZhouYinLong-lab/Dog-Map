import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const placesPath = path.join(root, 'src', 'data', 'places.json')
const evidencePath = path.join(root, 'data', 'place-coordinate-evidence.json')
const places = JSON.parse(readFileSync(placesPath, 'utf8'))
const evidence = JSON.parse(readFileSync(evidencePath, 'utf8'))
const errors = []

for (const place of places) {
  const coordinates = place.coordinates
  const [longitude, latitude] = Array.isArray(coordinates) ? coordinates : []

  if (!Array.isArray(coordinates) || coordinates.length !== 2 || !Number.isFinite(longitude) || !Number.isFinite(latitude)) {
    errors.push(`${place.id}: coordinates must be [longitude, latitude] numbers`)
    continue
  }

  if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
    errors.push(`${place.id}: coordinates are outside the valid longitude/latitude range`)
  }

  if (!['photo-exif', 'map-poi'].includes(place.coordinateSource)) {
    errors.push(`${place.id}: coordinateSource must be photo-exif or map-poi`)
  }

  if (typeof place.coordinateReference !== 'string' || place.coordinateReference.trim() === '') {
    errors.push(`${place.id}: coordinateReference is required`)
  }

  const record = evidence[place.id]
  if (!record) {
    errors.push(`${place.id}: missing data/place-coordinate-evidence.json record`)
    continue
  }

  const distance = distanceMeters(coordinates, record.coordinates)
  if (!Number.isFinite(distance)) {
    errors.push(`${place.id}: evidence coordinates are invalid`)
  } else if (distance > record.toleranceMeters) {
    errors.push(`${place.id}: location is ${Math.round(distance)}m from its evidence coordinate; maximum is ${record.toleranceMeters}m`)
  }
}

for (const id of Object.keys(evidence)) {
  if (!places.some((place) => place.id === id)) errors.push(`${id}: coordinate evidence has no matching place`)
}

if (errors.length > 0) {
  console.error('Place coordinate validation failed:')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log(`Validated ${places.length} place coordinates against committed evidence.`)

function distanceMeters(left, right) {
  if (!Array.isArray(right) || right.length !== 2 || !right.every(Number.isFinite)) return Number.NaN
  const [leftLongitude, leftLatitude] = left
  const [rightLongitude, rightLatitude] = right
  const latitudeDelta = toRadians(rightLatitude - leftLatitude)
  const longitudeDelta = toRadians(rightLongitude - leftLongitude)
  const latitudeA = toRadians(leftLatitude)
  const latitudeB = toRadians(rightLatitude)
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(latitudeA) * Math.cos(latitudeB) * Math.sin(longitudeDelta / 2) ** 2
  return 6371008.8 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
}

function toRadians(value) {
  return value * Math.PI / 180
}

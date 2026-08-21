import { randomUUID } from 'node:crypto'
import path from 'node:path'
import type { MediaKind } from './types'

const allowedTypes: Record<string, { kind: MediaKind; extension: string }> = {
  'image/jpeg': { kind: 'image', extension: 'jpg' },
  'image/png': { kind: 'image', extension: 'png' },
  'image/webp': { kind: 'image', extension: 'webp' },
  'image/gif': { kind: 'image', extension: 'gif' },
  'image/svg+xml': { kind: 'image', extension: 'svg' },
  'video/mp4': { kind: 'video', extension: 'mp4' },
  'video/webm': { kind: 'video', extension: 'webm' },
  'video/quicktime': { kind: 'video', extension: 'mov' },
}

export function validateUpload(file: { type: string; size: number }, env: NodeJS.ProcessEnv = process.env) {
  const metadata = allowedTypes[file.type]
  if (!metadata) throw new Error(`Unsupported media type: ${file.type || 'unknown'}`)
  const maxBytes = Number(env.MEDIA_MAX_BYTES ?? 524_288_000)
  if (!Number.isFinite(maxBytes) || maxBytes <= 0) throw new Error('MEDIA_MAX_BYTES must be a positive number')
  if (file.size > maxBytes) throw new Error(`Media file exceeds the ${Math.round(maxBytes / 1024 / 1024)} MB limit`)
  return metadata
}

export function buildObjectKey(placeId: string, originalName: string, extension: string) {
  const safePlaceId = slugify(placeId)
  const safeName = slugify(path.basename(originalName, path.extname(originalName))) || 'media'
  return `${safePlaceId}/${Date.now()}-${safeName}-${randomUUID().slice(0, 8)}.${extension}`
}

function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[^\w\-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 64)
}

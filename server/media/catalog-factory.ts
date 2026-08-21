import path from 'node:path'
import { JsonMediaCatalog } from './json-catalog'
import { PostgresMediaCatalog } from './postgres-catalog'
import type { MediaCatalog } from './types'

export function createMediaCatalog(env: NodeJS.ProcessEnv = process.env): MediaCatalog {
  const driver = env.MEDIA_DATABASE_DRIVER ?? 'json'
  if (driver === 'json') {
    return new JsonMediaCatalog(env.MEDIA_CATALOG_PATH ?? path.resolve(process.cwd(), 'data/media-catalog.json'))
  }
  if (driver === 'postgres') {
    if (!env.DATABASE_URL) throw new Error('Missing DATABASE_URL for postgres media catalog')
    return new PostgresMediaCatalog(env.DATABASE_URL)
  }
  throw new Error(`Unsupported MEDIA_DATABASE_DRIVER: ${driver}`)
}

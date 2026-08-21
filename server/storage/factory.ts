import path from 'node:path'
import { LocalStorageProvider } from './local'
import { R2StorageProvider } from './r2'
import type { StorageDriver, StorageProvider } from './types'

export function createStorageProvider(env: NodeJS.ProcessEnv = process.env): StorageProvider {
  const driver = (env.MEDIA_STORAGE_DRIVER ?? 'local') as StorageDriver
  if (driver === 'local') {
    return new LocalStorageProvider({
      root: env.MEDIA_LOCAL_ROOT ?? path.resolve(process.cwd(), 'data/media'),
      publicBaseUrl: env.MEDIA_LOCAL_PUBLIC_BASE_URL ?? '/api/media/file',
    })
  }

  if (driver === 'r2') {
    const required = ['R2_ENDPOINT', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET', 'R2_PUBLIC_BASE_URL'] as const
    const missing = required.filter((key) => !env[key])
    if (missing.length > 0) throw new Error(`Missing R2 configuration: ${missing.join(', ')}`)
    return new R2StorageProvider({
      endpoint: env.R2_ENDPOINT!,
      accessKeyId: env.R2_ACCESS_KEY_ID!,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
      bucket: env.R2_BUCKET!,
      publicBaseUrl: env.R2_PUBLIC_BASE_URL!,
    })
  }

  throw new Error(`Unsupported MEDIA_STORAGE_DRIVER: ${driver}`)
}

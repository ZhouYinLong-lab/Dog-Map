import { createHash } from 'node:crypto'
import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { PutObjectInput, ReadObject, StorageProvider, StoredObject } from './types'
import { normalizeObjectKey, resolveSafePath } from './keys'

type LocalStorageOptions = {
  root: string
  publicBaseUrl?: string
}

export class LocalStorageProvider implements StorageProvider {
  readonly driver = 'local' as const
  private readonly root: string
  private readonly publicBaseUrl: string

  constructor(options: LocalStorageOptions) {
    this.root = path.resolve(options.root)
    this.publicBaseUrl = options.publicBaseUrl ?? '/api/media/file'
  }

  async putObject(input: PutObjectInput): Promise<StoredObject> {
    const key = normalizeObjectKey(input.key)
    const target = resolveSafePath(this.root, key)
    await mkdir(path.dirname(target), { recursive: true })
    await writeFile(target, input.body)
    const size = input.body.byteLength
    const etag = createHash('sha256').update(input.body).digest('hex')
    return { key, url: this.getPublicUrl(key), size, contentType: input.contentType, etag }
  }

  async readObject(key: string): Promise<ReadObject | null> {
    const target = resolveSafePath(this.root, key)
    try {
      const body = await readFile(target)
      const metadata = await stat(target)
      return {
        body,
        contentType: contentTypeFromPath(target),
        size: metadata.size,
        etag: createHash('sha256').update(body).digest('hex'),
      }
    } catch (error) {
      if (isFileMissing(error)) return null
      throw error
    }
  }

  async headObject(key: string): Promise<StoredObject | null> {
    const target = resolveSafePath(this.root, key)
    try {
      const metadata = await stat(target)
      return {
        key: normalizeObjectKey(key),
        url: this.getPublicUrl(key),
        size: metadata.size,
        contentType: contentTypeFromPath(target),
      }
    } catch (error) {
      if (isFileMissing(error)) return null
      throw error
    }
  }

  async deleteObject(key: string) {
    const target = resolveSafePath(this.root, key)
    await rm(target, { force: true })
  }

  getPublicUrl(key: string) {
    return `${this.publicBaseUrl.replace(/\/$/, '')}?key=${encodeURIComponent(normalizeObjectKey(key))}`
  }
}

function isFileMissing(error: unknown): error is NodeJS.ErrnoException {
  return Boolean(error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT')
}

function contentTypeFromPath(filePath: string) {
  const extension = path.extname(filePath).toLowerCase()
  return {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
  }[extension] ?? 'application/octet-stream'
}

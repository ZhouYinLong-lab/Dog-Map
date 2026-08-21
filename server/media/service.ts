import { randomUUID } from 'node:crypto'
import type { StorageProvider } from '../storage/types'
import { buildObjectKey, validateUpload } from './validation'
import type { MediaCatalog, MediaAsset } from './types'

export type UploadMediaInput = {
  placeId: string
  file: { name: string; type: string; size: number; arrayBuffer(): Promise<ArrayBuffer> }
  altText?: string
  caption?: string
  sortOrder?: number
}

export class MediaService {
  constructor(
    private readonly storage: StorageProvider,
    private readonly catalog: MediaCatalog,
    private readonly env: NodeJS.ProcessEnv = process.env,
  ) {}

  list(placeId?: string) {
    return this.catalog.list(placeId)
  }

  async upload(input: UploadMediaInput): Promise<MediaAsset> {
    const metadata = validateUpload(input.file, this.env)
    const body = new Uint8Array(await input.file.arrayBuffer())
    const objectKey = buildObjectKey(input.placeId, input.file.name, metadata.extension)
    const stored = await this.storage.putObject({
      key: objectKey,
      body,
      contentType: input.file.type,
      cacheControl: 'public, max-age=31536000, immutable',
    })

    try {
      return await this.catalog.create({
        id: randomUUID(),
        placeId: input.placeId,
        storageDriver: this.storage.driver,
        objectKey: stored.key,
        publicUrl: stored.url,
        kind: metadata.kind,
        originalName: input.file.name,
        contentType: input.file.type,
        byteSize: stored.size,
        width: null,
        height: null,
        durationMs: null,
        posterObjectKey: null,
        altText: input.altText?.trim() || input.file.name,
        caption: input.caption?.trim() || null,
        sortOrder: Number.isFinite(input.sortOrder) ? Number(input.sortOrder) : 0,
      })
    } catch (error) {
      await this.storage.deleteObject(stored.key).catch(() => undefined)
      throw error
    }
  }

  async delete(id: string) {
    const asset = await this.catalog.findById(id)
    if (!asset) return false
    await this.storage.deleteObject(asset.objectKey)
    await this.catalog.delete(id)
    return true
  }
}

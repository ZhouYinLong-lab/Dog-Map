import type { StorageDriver } from '../storage/types'

export type MediaKind = 'image' | 'video'

export type MediaAsset = {
  id: string
  placeId: string
  storageDriver: StorageDriver
  objectKey: string
  publicUrl: string
  kind: MediaKind
  originalName: string
  contentType: string
  byteSize: number
  width: number | null
  height: number | null
  durationMs: number | null
  posterObjectKey: string | null
  altText: string
  caption: string | null
  sortOrder: number
  createdAt: string
}

export type CreateMediaAssetInput = Omit<MediaAsset, 'id' | 'createdAt'> & { id?: string; createdAt?: string }

export interface MediaCatalog {
  list(placeId?: string): Promise<MediaAsset[]>
  findById(id: string): Promise<MediaAsset | null>
  create(input: CreateMediaAssetInput): Promise<MediaAsset>
  delete(id: string): Promise<void>
}

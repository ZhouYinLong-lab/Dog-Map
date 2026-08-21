export type StorageDriver = 'local' | 'r2'

export type PutObjectInput = {
  key: string
  body: Uint8Array
  contentType: string
  cacheControl?: string
}

export type StoredObject = {
  key: string
  url: string
  size: number
  contentType: string
  etag?: string
}

export type ReadObject = {
  body: Uint8Array
  contentType: string
  size: number
  etag?: string
}

export interface StorageProvider {
  readonly driver: StorageDriver
  putObject(input: PutObjectInput): Promise<StoredObject>
  readObject(key: string): Promise<ReadObject | null>
  headObject(key: string): Promise<StoredObject | null>
  deleteObject(key: string): Promise<void>
  getPublicUrl(key: string): string
}

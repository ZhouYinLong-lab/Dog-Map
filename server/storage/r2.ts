import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { normalizeObjectKey, publicObjectPath } from './keys'
import type { PutObjectInput, ReadObject, StorageProvider, StoredObject } from './types'

type R2StorageOptions = {
  endpoint: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  publicBaseUrl: string
}

export class R2StorageProvider implements StorageProvider {
  readonly driver = 'r2' as const
  private readonly client: S3Client
  private readonly bucket: string
  private readonly publicBaseUrl: string

  constructor(options: R2StorageOptions) {
    this.client = new S3Client({
      region: 'auto',
      endpoint: options.endpoint,
      credentials: {
        accessKeyId: options.accessKeyId,
        secretAccessKey: options.secretAccessKey,
      },
    })
    this.bucket = options.bucket
    this.publicBaseUrl = options.publicBaseUrl
  }

  async putObject(input: PutObjectInput): Promise<StoredObject> {
    const key = normalizeObjectKey(input.key)
    const result = await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: input.body,
      ContentType: input.contentType,
      CacheControl: input.cacheControl,
    }))
    return {
      key,
      url: this.getPublicUrl(key),
      size: input.body.byteLength,
      contentType: input.contentType,
      etag: result.ETag?.replaceAll('"', ''),
    }
  }

  async readObject(key: string): Promise<ReadObject | null> {
    const normalizedKey = normalizeObjectKey(key)
    try {
      const result = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: normalizedKey }))
      if (!result.Body) return null
      const body = await result.Body.transformToByteArray()
      return {
        body,
        contentType: result.ContentType ?? 'application/octet-stream',
        size: body.byteLength,
        etag: result.ETag?.replaceAll('"', ''),
      }
    } catch (error) {
      if (isNotFound(error)) return null
      throw error
    }
  }

  async headObject(key: string): Promise<StoredObject | null> {
    const normalizedKey = normalizeObjectKey(key)
    try {
      const result = await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: normalizedKey }))
      return {
        key: normalizedKey,
        url: this.getPublicUrl(normalizedKey),
        size: result.ContentLength ?? 0,
        contentType: result.ContentType ?? 'application/octet-stream',
        etag: result.ETag?.replaceAll('"', ''),
      }
    } catch (error) {
      if (isNotFound(error)) return null
      throw error
    }
  }

  async deleteObject(key: string) {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: normalizeObjectKey(key) }))
  }

  getPublicUrl(key: string) {
    return publicObjectPath(this.publicBaseUrl, key)
  }
}

function isNotFound(error: unknown) {
  if (!error || typeof error !== 'object') return false
  const candidate = error as { name?: string; $metadata?: { httpStatusCode?: number } }
  return candidate.name === 'NoSuchKey' || candidate.name === 'NotFound' || candidate.$metadata?.httpStatusCode === 404
}

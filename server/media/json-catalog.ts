import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { CreateMediaAssetInput, MediaAsset, MediaCatalog } from './types'

export class JsonMediaCatalog implements MediaCatalog {
  private readonly filePath: string
  private lock: Promise<void> = Promise.resolve()

  constructor(filePath: string) {
    this.filePath = path.resolve(filePath)
  }

  async list(placeId?: string) {
    const assets = await this.read()
    return assets
      .filter((asset) => !placeId || asset.placeId === placeId)
      .sort((left, right) => left.sortOrder - right.sortOrder || left.createdAt.localeCompare(right.createdAt))
  }

  async findById(id: string) {
    return (await this.read()).find((asset) => asset.id === id) ?? null
  }

  async create(input: CreateMediaAssetInput) {
    return this.withLock(async () => {
      const assets = await this.read()
      const asset: MediaAsset = {
        ...input,
        id: input.id ?? randomUUID(),
        createdAt: input.createdAt ?? new Date().toISOString(),
      }
      assets.push(asset)
      await this.write(assets)
      return asset
    })
  }

  async delete(id: string) {
    await this.withLock(async () => {
      const assets = await this.read()
      await this.write(assets.filter((asset) => asset.id !== id))
    })
  }

  private async read(): Promise<MediaAsset[]> {
    try {
      const raw = await readFile(this.filePath, 'utf8')
      const parsed: unknown = JSON.parse(raw)
      if (!Array.isArray(parsed)) throw new Error('Media catalog must contain a JSON array')
      return parsed as MediaAsset[]
    } catch (error) {
      if (isMissingFile(error)) {
        await mkdir(path.dirname(this.filePath), { recursive: true })
        await writeFile(this.filePath, '[]\n', 'utf8')
        return []
      }
      throw error
    }
  }

  private async write(assets: MediaAsset[]) {
    await mkdir(path.dirname(this.filePath), { recursive: true })
    const temporaryPath = `${this.filePath}.${process.pid}.tmp`
    await writeFile(temporaryPath, `${JSON.stringify(assets, null, 2)}\n`, 'utf8')
    await rename(temporaryPath, this.filePath)
  }

  private async withLock<T>(task: () => Promise<T>): Promise<T> {
    const previous = this.lock
    let release!: () => void
    this.lock = new Promise<void>((resolve) => { release = resolve })
    await previous
    try {
      return await task()
    } finally {
      release()
    }
  }
}

function isMissingFile(error: unknown): error is NodeJS.ErrnoException {
  return Boolean(error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT')
}

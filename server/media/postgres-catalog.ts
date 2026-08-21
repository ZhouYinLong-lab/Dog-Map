import { Pool } from 'pg'
import type { CreateMediaAssetInput, MediaAsset, MediaCatalog } from './types'

type MediaRow = {
  id: string
  place_id: string
  storage_driver: MediaAsset['storageDriver']
  object_key: string
  public_url: string
  kind: MediaAsset['kind']
  original_name: string
  content_type: string
  byte_size: string | number
  width: number | null
  height: number | null
  duration_ms: number | null
  poster_object_key: string | null
  alt_text: string
  caption: string | null
  sort_order: number
  created_at: Date | string
}

export class PostgresMediaCatalog implements MediaCatalog {
  private readonly pool: Pool

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString })
  }

  async list(placeId?: string) {
    const result = await this.pool.query<MediaRow>(
      `SELECT * FROM media_assets
       WHERE ($1::text IS NULL OR place_id = $1)
       ORDER BY sort_order ASC, created_at ASC`,
      [placeId ?? null],
    )
    return result.rows.map(mapRow)
  }

  async findById(id: string) {
    const result = await this.pool.query<MediaRow>('SELECT * FROM media_assets WHERE id = $1 LIMIT 1', [id])
    return result.rows[0] ? mapRow(result.rows[0]) : null
  }

  async create(input: CreateMediaAssetInput) {
    const result = await this.pool.query<MediaRow>(
      `INSERT INTO media_assets (
        id, place_id, storage_driver, object_key, public_url, kind,
        original_name, content_type, byte_size, width, height, duration_ms,
        poster_object_key, alt_text, caption, sort_order, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        input.id,
        input.placeId,
        input.storageDriver,
        input.objectKey,
        input.publicUrl,
        input.kind,
        input.originalName,
        input.contentType,
        input.byteSize,
        input.width,
        input.height,
        input.durationMs,
        input.posterObjectKey,
        input.altText,
        input.caption,
        input.sortOrder,
        input.createdAt,
      ],
    )
    return mapRow(result.rows[0])
  }

  async delete(id: string) {
    await this.pool.query('DELETE FROM media_assets WHERE id = $1', [id])
  }
}

function mapRow(row: MediaRow): MediaAsset {
  return {
    id: row.id,
    placeId: row.place_id,
    storageDriver: row.storage_driver,
    objectKey: row.object_key,
    publicUrl: row.public_url,
    kind: row.kind,
    originalName: row.original_name,
    contentType: row.content_type,
    byteSize: Number(row.byte_size),
    width: row.width,
    height: row.height,
    durationMs: row.duration_ms,
    posterObjectKey: row.poster_object_key,
    altText: row.alt_text,
    caption: row.caption,
    sortOrder: row.sort_order,
    createdAt: new Date(row.created_at).toISOString(),
  }
}

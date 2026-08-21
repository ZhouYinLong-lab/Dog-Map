import { cors } from 'hono/cors'
import { Hono, type Context } from 'hono'
import { createMediaCatalog } from './catalog-factory'
import { MediaService } from './service'
import { createStorageProvider } from '../storage/factory'

export function createMediaApi(env: NodeJS.ProcessEnv = process.env) {
  const storage = createStorageProvider(env)
  const catalog = createMediaCatalog(env)
  const service = new MediaService(storage, catalog, env)
  const app = new Hono()

  app.use('*', cors({
    origin: env.MEDIA_API_ORIGIN ?? '*',
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  }))

  app.get('/api/health', (c) => c.json({ ok: true, storage: storage.driver, database: env.MEDIA_DATABASE_DRIVER ?? 'json' }))

  app.get('/api/media', async (c) => {
    const placeId = c.req.query('placeId')
    return c.json({ items: await service.list(placeId) })
  })

  app.post('/api/media', async (c) => {
    const denied = requireAdmin(c, env)
    if (denied) return denied
    try {
      const body = await c.req.parseBody()
      const file = body.file
      if (!isFileLike(file)) return c.json({ error: 'file is required' }, 400)
      const asset = await service.upload({
        placeId: firstString(body.placeId) ?? 'unassigned',
        file: {
          name: file.name || 'media',
          type: file.type,
          size: file.size,
          arrayBuffer: () => file.arrayBuffer(),
        },
        altText: firstString(body.altText),
        caption: firstString(body.caption),
        sortOrder: Number(firstString(body.sortOrder) ?? 0),
      })
      return c.json({ item: asset }, 201)
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : 'Upload failed' }, 400)
    }
  })

  app.delete('/api/media/:id', async (c) => {
    const denied = requireAdmin(c, env)
    if (denied) return denied
    const removed = await service.delete(c.req.param('id'))
    return removed ? c.body(null, 204) : c.json({ error: 'Media asset not found' }, 404)
  })

  app.get('/api/media/file', async (c) => {
    const key = c.req.query('key') ?? ''
    if (!key) return c.notFound()
    const object = await storage.readObject(key)
    if (!object) return c.notFound()
    return new Response(Buffer.from(object.body), {
      headers: {
        'Content-Type': object.contentType,
        'Content-Length': String(object.size),
        'Cache-Control': 'public, max-age=31536000, immutable',
        ...(object.etag ? { ETag: object.etag } : {}),
      },
    })
  })

  return app
}

function isFileLike(value: unknown): value is File {
  return Boolean(value && typeof value === 'object' && 'arrayBuffer' in value && 'size' in value && 'type' in value)
}

function firstString(value: unknown) {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return undefined
}

function requireAdmin(c: Context, env: NodeJS.ProcessEnv) {
  const configuredToken = env.MEDIA_ADMIN_TOKEN?.trim()
  if (!configuredToken && env.MEDIA_STORAGE_DRIVER === 'r2') {
    return c.json({ error: 'MEDIA_ADMIN_TOKEN is required when R2 storage is enabled' }, 503)
  }
  if (!configuredToken) return null
  const authorization = c.req.header('Authorization')
  if (authorization !== `Bearer ${configuredToken}`) {
    return c.json({ error: 'Admin authorization required' }, 401)
  }
  return null
}

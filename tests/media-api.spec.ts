import { randomUUID } from 'node:crypto'
import { expect, test } from '@playwright/test'

test('local media API supports upload, readback, catalog, and delete', async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Run the API mutation test once, not once per viewport project')
  const placeId = `e2e-${randomUUID()}`
  let assetId = ''
  const sampleSvg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" fill="#e6333b"/></svg>')

  try {
    const upload = await request.post('http://127.0.0.1:8787/api/media', {
      multipart: {
        file: { name: 'e2e.svg', mimeType: 'image/svg+xml', buffer: sampleSvg },
        placeId,
        altText: 'Playwright media test',
      },
    })
    expect(upload.status()).toBe(201)
    const payload = await upload.json() as { item: { id: string; publicUrl: string; byteSize: number } }
    assetId = payload.item.id
    expect(payload.item.byteSize).toBe(sampleSvg.byteLength)

    const catalog = await request.get(`http://127.0.0.1:8787/api/media?placeId=${placeId}`)
    expect(catalog.ok()).toBeTruthy()
    expect((await catalog.json()).items).toHaveLength(1)

    const media = await request.get(new URL(payload.item.publicUrl, 'http://127.0.0.1:8787').toString())
    expect(media.status()).toBe(200)
    expect(media.headers()['content-type']).toContain('image/svg+xml')
    expect((await media.body()).byteLength).toBe(sampleSvg.byteLength)
  } finally {
    if (assetId) {
      const deletion = await request.delete(`http://127.0.0.1:8787/api/media/${assetId}`)
      expect(deletion.status()).toBe(204)
    }
  }
})

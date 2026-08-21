import type { MediaItem } from '../types/content'

type ApiMediaAsset = {
  publicUrl: string
  kind: 'image' | 'video'
  altText: string
  caption: string | null
  sortOrder: number
}

export async function loadRemoteMedia(placeId: string, signal?: AbortSignal): Promise<MediaItem[] | null> {
  const apiBaseUrl = import.meta.env.VITE_MEDIA_API_URL?.trim()
  if (!apiBaseUrl) return null

  const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/api/media?placeId=${encodeURIComponent(placeId)}`, { signal })
  if (!response.ok) throw new Error(`Media API returned ${response.status}`)
  const payload = await response.json() as { items?: ApiMediaAsset[] }
  if (!Array.isArray(payload.items) || payload.items.length === 0) return null

  return payload.items
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((asset) => ({
      type: asset.kind,
      src: asset.kind === 'video' ? asset.publicUrl : asset.publicUrl,
      alt: asset.altText,
      caption: asset.caption ?? undefined,
    }))
}

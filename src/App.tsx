import { useCallback, useEffect, useMemo, useState } from 'react'
import { MapView } from './components/MapView'
import { places, routes } from './data/content'
import { loadRemoteMedia } from './services/mediaApi'
import type { MediaItem } from './types/content'
import { artworkDataUri } from './map/artwork'

function MediaBlock({ item, onPreview }: { item: MediaItem; onPreview: () => void }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className="media-error" role="img" aria-label={`${item.alt}加载失败`}>
        <span>MEDIA SIGNAL LOST</span>
        <small>{item.alt}</small>
      </div>
    )
  }

  if (item.type === 'video' && item.src) {
    return <video className="media-block" controls preload="metadata" poster={item.poster} src={item.src} aria-label={item.alt} onError={() => setFailed(true)} />
  }

  if (item.type === 'video') {
    return (
      <div className="video-placeholder" role="img" aria-label={item.alt} style={{ backgroundImage: `url(${item.poster})` }}>
        <span className="video-placeholder__play">▶</span>
        <span className="video-placeholder__caption">VIDEO SLOT / DROP FILE HERE</span>
      </div>
    )
  }

  return (
    <figure className="media-figure">
      <button className="media-preview-trigger" type="button" onClick={onPreview} aria-label={`预览：${item.alt}`}>
        <img className="media-block" src={item.src} alt={item.alt} loading="lazy" onError={() => setFailed(true)} />
      </button>
      {item.caption && <figcaption>{item.caption}</figcaption>}
    </figure>
  )
}

function ImageLightbox({ items, index, onClose, onNavigate }: { items: MediaItem[]; index: number; onClose: () => void; onNavigate: (index: number) => void }) {
  const item = items[index]
  const canGoPrevious = index > 0
  const canGoNext = index < items.length - 1

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft' && canGoPrevious) onNavigate(index - 1)
      if (event.key === 'ArrowRight' && canGoNext) onNavigate(index + 1)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [canGoNext, canGoPrevious, index, onClose, onNavigate])

  if (!item) return null

  return (
    <div
      className="media-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`图片预览：${item.alt}`}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      >
      <button className="media-lightbox__close" type="button" onClick={onClose} aria-label="关闭图片预览" autoFocus>×</button>
      <div className="media-lightbox__stage" onClick={(event) => event.stopPropagation()}>
        <img className="media-lightbox__image" src={item.src} alt={item.alt} />
        <button
          className="media-lightbox__nav media-lightbox__nav--previous"
          type="button"
          onClick={() => onNavigate(index - 1)}
          disabled={!canGoPrevious}
          aria-label="上一张图片"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
        </button>
        <button
          className="media-lightbox__nav media-lightbox__nav--next"
          type="button"
          onClick={() => onNavigate(index + 1)}
          disabled={!canGoNext}
          aria-label="下一张图片"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function App() {
  const [activePlaceId, setActivePlaceId] = useState<string | null>(null)
  const [hoveredPlaceId, setHoveredPlaceId] = useState<string | null>(null)
  const [activeRouteId, setActiveRouteId] = useState<string | null>(routes[0]?.id ?? null)
  const [remoteMedia, setRemoteMedia] = useState<Record<string, MediaItem[]>>({})
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)

  const activePlace = useMemo(
    () => places.find((place) => place.id === activePlaceId) ?? null,
    [activePlaceId],
  )
  const previewItems = activePlace ? (remoteMedia[activePlace.id] ?? activePlace.media) : []
  const previewItem = previewIndex === null ? null : previewItems[previewIndex] ?? null
  useEffect(() => {
    if (!activePlace) return
    const controller = new AbortController()
    loadRemoteMedia(activePlace.id, controller.signal)
      .then((items) => {
        if (items) setRemoteMedia((current) => ({ ...current, [activePlace.id]: items }))
      })
      .catch(() => undefined)
    return () => controller.abort()
  }, [activePlace])

  const handleHoverPlace = useCallback((placeId: string | null) => {
    setHoveredPlaceId(placeId)
  }, [])

  const handleSelectPlace = useCallback((placeId: string) => {
    setActivePlaceId(placeId)
  }, [])

  const handleSelectRoute = useCallback((routeId: string) => {
    setActiveRouteId(routeId)
  }, [])

  return (
    <main className={`app-shell ${activePlace ? 'has-detail' : ''}`}>
      <div className="map-stage">
        <MapView
          places={places}
          routes={routes}
          activePlaceId={activePlaceId}
          hoveredPlaceId={hoveredPlaceId}
          activeRouteId={activeRouteId}
          onHoverPlace={handleHoverPlace}
          onSelectPlace={handleSelectPlace}
          onSelectRoute={handleSelectRoute}
        />

      </div>

      {activePlace && (
        <aside className="detail-drawer" aria-label={`${activePlace.title}详情`}>
          <button className="detail-drawer__close" type="button" onClick={() => setActivePlaceId(null)} aria-label="关闭详情">×</button>
          <div className="detail-drawer__identity" aria-label={activePlace.title}>
            <img
              className="detail-drawer__identity-icon"
              src={activePlace.markerImage ?? artworkDataUri(activePlace.id, activePlace.accent, activePlace.art)}
              alt=""
              aria-hidden="true"
            />
            <div className="detail-drawer__identity-copy">
              <h1 className="detail-drawer__identity-name">{activePlace.title}</h1>
              <p className="detail-drawer__identity-subtitle">{activePlace.subtitle}</p>
            </div>
          </div>
          <div className="media-grid">
            {previewItems.map((item, index) => <MediaBlock key={`${item.type}-${index}`} item={item} onPreview={() => setPreviewIndex(index)} />)}
          </div>
        </aside>
      )}

      {previewItem && previewIndex !== null && (
        <ImageLightbox
          items={previewItems}
          index={previewIndex}
          onClose={() => setPreviewIndex(null)}
          onNavigate={setPreviewIndex}
        />
      )}

      <a
        className="github-repo-link"
        href="https://github.com/ZhouYinLong-lab/Dog-Map"
        target="_blank"
        rel="noreferrer"
        aria-label="打开 Dog Map GitHub 仓库"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M12 .7a11.3 11.3 0 0 0-3.57 22.02c.57.1.78-.25.78-.55v-2.14c-3.17.69-3.84-1.34-3.84-1.34-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.74 2.68 1.24 3.33.95.1-.74.4-1.24.73-1.53-2.53-.29-5.2-1.27-5.2-5.65 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.13 1.17a10.86 10.86 0 0 1 5.7 0c2.17-1.48 3.13-1.17 3.13-1.17.62 1.57.23 2.73.11 3.02.73.8 1.18 1.82 1.18 3.07 0 4.39-2.68 5.35-5.22 5.64.41.36.78 1.07.78 2.16v3.2c0 .3.2.66.79.55A11.3 11.3 0 0 0 12 .7Z" />
        </svg>
      </a>
    </main>
  )
}

export default App

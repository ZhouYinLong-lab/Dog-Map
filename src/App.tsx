import { useCallback, useEffect, useMemo, useState } from 'react'
import { MapView } from './components/MapView'
import { places, routes } from './data/content'
import { loadRemoteMedia } from './services/mediaApi'
import type { MediaItem } from './types/content'
import { artworkDataUri } from './map/artwork'

function MediaBlock({ item, onPreview }: { item: MediaItem; onPreview: (item: MediaItem) => void }) {
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
      <button className="media-preview-trigger" type="button" onClick={() => onPreview(item)} aria-label={`预览：${item.alt}`}>
        <img className="media-block" src={item.src} alt={item.alt} loading="lazy" onError={() => setFailed(true)} />
      </button>
      {item.caption && <figcaption>{item.caption}</figcaption>}
    </figure>
  )
}

function ImageLightbox({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

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
      <img className="media-lightbox__image" src={item.src} alt={item.alt} onClick={(event) => event.stopPropagation()} />
    </div>
  )
}

function App() {
  const [activePlaceId, setActivePlaceId] = useState<string | null>(null)
  const [hoveredPlaceId, setHoveredPlaceId] = useState<string | null>(null)
  const [activeRouteId, setActiveRouteId] = useState<string | null>(routes[0]?.id ?? null)
  const [remoteMedia, setRemoteMedia] = useState<Record<string, MediaItem[]>>({})
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null)

  const activePlace = useMemo(
    () => places.find((place) => place.id === activePlaceId) ?? null,
    [activePlaceId],
  )
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
            <span className="detail-drawer__identity-name">{activePlace.title}</span>
          </div>
          <h1 className="detail-drawer__media-title">{activePlace.subtitle}</h1>
          <div className="media-grid">
            {(remoteMedia[activePlace.id] ?? activePlace.media).map((item, index) => <MediaBlock key={`${item.type}-${index}`} item={item} onPreview={setPreviewItem} />)}
          </div>
        </aside>
      )}

      {previewItem && <ImageLightbox item={previewItem} onClose={() => setPreviewItem(null)} />}
    </main>
  )
}

export default App

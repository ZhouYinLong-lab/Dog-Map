import { useCallback, useEffect, useMemo, useState } from 'react'
import { MapView } from './components/MapView'
import { places, routes } from './data/content'
import { loadRemoteMedia } from './services/mediaApi'
import type { MediaItem } from './types/content'
import { getRouteColor } from './map/routePalette'
import { artworkDataUri } from './map/artwork'

function MediaBlock({ item }: { item: MediaItem }) {
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
      <img className="media-block" src={item.src} alt={item.alt} loading="lazy" onError={() => setFailed(true)} />
      {item.caption && <figcaption>{item.caption}</figcaption>}
    </figure>
  )
}

function VisualPattern({ id, color, art }: { id: string; color: 'red' | 'teal' | 'yellow'; art?: Parameters<typeof artworkDataUri>[2] }) {
  return <img className="visual-pattern" src={artworkDataUri(id, color, art)} alt="" aria-hidden="true" />
}

function artworkColor(index: number): 'red' | 'teal' | 'yellow' {
  return ['red', 'teal', 'yellow'][index % 3] as 'red' | 'teal' | 'yellow'
}

function App() {
  const [activePlaceId, setActivePlaceId] = useState<string | null>(null)
  const [hoveredPlaceId, setHoveredPlaceId] = useState<string | null>(null)
  const [activeRouteId, setActiveRouteId] = useState<string | null>(routes[0]?.id ?? null)
  const [remoteMedia, setRemoteMedia] = useState<Record<string, MediaItem[]>>({})

  const activePlace = useMemo(
    () => places.find((place) => place.id === activePlaceId) ?? null,
    [activePlaceId],
  )
  const activeRoute = useMemo(
    () => routes.find((route) => route.id === activeRouteId) ?? null,
    [activeRouteId],
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

        <div className="map-grain" aria-hidden="true" />
        <div className="map-slice map-slice--top" aria-hidden="true" />
        <div className="map-slice map-slice--bottom" aria-hidden="true" />

        <div className="bottom-strip">
          {!activePlace && activeRoute && (
            <div className="route-focus-card" aria-label={`${activeRoute.title}路线图案`}>
              <VisualPattern id={activeRoute.id} color={artworkColor(routes.indexOf(activeRoute))} art={activeRoute.art} />
              <div>
                <span className="route-focus-card__title">{activeRoute.title}</span>
                <span className="route-focus-card__mode">{activeRoute.mode}</span>
              </div>
            </div>
          )}
          <div className="route-legend" role="region" aria-label="路线图例">
            {routes.map((route, index) => (
              <button
                className={`route-legend__route ${route.id === activeRouteId ? 'is-active' : ''}`}
                key={route.id}
                type="button"
                aria-pressed={route.id === activeRouteId}
                onClick={() => handleSelectRoute(route.id)}
              >
                <span className="route-legend__line" style={{ backgroundColor: getRouteColor(index) }} />
                <span>{route.title}</span>
              </button>
            ))}
            <div className="route-legend__destination">
              <span className="route-legend__dot" />
              <span>DESTINATION</span>
            </div>
          </div>
        </div>
      </div>

      {activePlace && (
        <aside className="detail-drawer" aria-label={`${activePlace.title}详情`}>
          <button className="detail-drawer__close" type="button" onClick={() => setActivePlaceId(null)} aria-label="关闭详情">×</button>
          <div className="detail-drawer__header">
            <span className="eyebrow">{activePlace.date} / {activePlace.accent.toUpperCase()}</span>
            <span className="detail-drawer__slash">///</span>
          </div>
          <h1>{activePlace.title}</h1>
          <p className="detail-drawer__subtitle">{activePlace.subtitle}</p>
          <p className="detail-drawer__description">{activePlace.description}</p>
          <VisualPattern id={activePlace.id} color={activePlace.accent} art={activePlace.art} />
          <div className="media-grid">
            {(remoteMedia[activePlace.id] ?? activePlace.media).map((item, index) => <MediaBlock key={`${item.type}-${index}`} item={item} />)}
          </div>
          <div className="detail-drawer__footer">
            <span>LOCATION LOCKED</span>
            <span>{activePlace.coordinates[1].toFixed(4)} / {activePlace.coordinates[0].toFixed(4)}</span>
          </div>
        </aside>
      )}
    </main>
  )
}

export default App

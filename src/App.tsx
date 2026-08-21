import { useCallback, useMemo, useState } from 'react'
import { MapView } from './components/MapView'
import { places, routes } from './data/content'
import type { MediaItem } from './types/content'

function MediaBlock({ item }: { item: MediaItem }) {
  if (item.type === 'video' && item.src) {
    return <video className="media-block" controls preload="metadata" poster={item.poster} src={item.src} aria-label={item.alt} />
  }

  if (item.type === 'video') {
    return (
      <div className="video-placeholder" role="img" aria-label={item.alt} style={{ backgroundImage: `url(${item.poster})` }}>
        <span className="video-placeholder__play">▶</span>
        <span className="video-placeholder__caption">VIDEO SLOT / DROP FILE HERE</span>
      </div>
    )
  }

  return <img className="media-block" src={item.src} alt={item.alt} loading="lazy" />
}

function App() {
  const [activePlaceId, setActivePlaceId] = useState<string | null>(null)
  const [hoveredPlaceId, setHoveredPlaceId] = useState<string | null>(null)

  const activePlace = useMemo(
    () => places.find((place) => place.id === activePlaceId) ?? null,
    [activePlaceId],
  )

  const handleHoverPlace = useCallback((placeId: string | null) => {
    setHoveredPlaceId(placeId)
  }, [])

  const handleSelectPlace = useCallback((placeId: string) => {
    setActivePlaceId(placeId)
  }, [])

  return (
    <main className={`app-shell ${activePlace ? 'has-detail' : ''}`}>
      <div className="map-stage">
        <MapView
          places={places}
          routes={routes}
          activePlaceId={activePlaceId}
          hoveredPlaceId={hoveredPlaceId}
          onHoverPlace={handleHoverPlace}
          onSelectPlace={handleSelectPlace}
        />

        <div className="map-grain" aria-hidden="true" />
        <div className="map-slice map-slice--top" aria-hidden="true" />
        <div className="map-slice map-slice--bottom" aria-hidden="true" />

        <div className="status-stamp" aria-hidden="true">
          <span>SUZHOU</span>
          <strong>ROUTE<br />ARCHIVE</strong>
        </div>

        <div className="map-readout" aria-hidden="true">
          <span>31°16'N</span>
          <span className="map-readout__slash">/</span>
          <span>120°44'E</span>
        </div>

        <div className="bottom-strip">
          <div className="bottom-strip__copy">
            <span className="eyebrow">NEW SEMESTER / 2026</span>
            <strong>MOVE THROUGH<br />THE CITY</strong>
          </div>
          <div className="route-legend" aria-label="路线图例">
            <span className="route-legend__line" />
            <span>RECORDED ROUTE</span>
            <span className="route-legend__dot" />
            <span>DESTINATION</span>
          </div>
          <div className="bottom-strip__hint">HOVER / TAP A STATION</div>
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
          <div className="media-grid">
            {activePlace.media.map((item, index) => <MediaBlock key={`${item.type}-${index}`} item={item} />)}
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

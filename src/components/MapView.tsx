import { useEffect, useRef } from 'react'
import maplibregl, { type Map } from 'maplibre-gl'
import type { Place, Route } from '../types/content'

type MapViewProps = {
  places: Place[]
  routes: Route[]
  activePlaceId: string | null
  hoveredPlaceId: string | null
  onHoverPlace: (placeId: string | null) => void
  onSelectPlace: (placeId: string) => void
}

const mapStyle: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm-base',
      type: 'raster',
      source: 'osm',
      paint: {
        'raster-saturation': -1,
        'raster-contrast': 0.22,
        'raster-brightness-min': 0.08,
        'raster-brightness-max': 0.68,
        'raster-opacity': 0.76,
      },
    },
  ],
}

function routeFeatureCollection(data: Route[]) {
  return {
    type: 'FeatureCollection' as const,
    features: data.map((item) => ({
      type: 'Feature' as const,
      properties: { id: item.id },
      geometry: {
        type: 'LineString' as const,
        coordinates: item.coordinates,
      },
    })),
  }
}

export function MapView({
  places,
  routes,
  activePlaceId,
  hoveredPlaceId,
  onHoverPlace,
  onSelectPlace,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])

  useEffect(() => {
    if (!mapContainerRef.current) return

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center: [120.68, 31.3],
      zoom: 10.8,
      minZoom: 9,
      maxZoom: 17,
      attributionControl: false,
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right')
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left')

    map.on('load', () => {
      map.addSource('routes', {
        type: 'geojson',
        data: routeFeatureCollection(routes),
      })

      map.addLayer({
        id: 'route-shadow',
        type: 'line',
        source: 'routes',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#0a0a0a',
          'line-width': ['interpolate', ['linear'], ['zoom'], 9, 8, 13, 12, 17, 18],
          'line-opacity': 0.86,
        },
      })

      map.addLayer({
        id: 'route-core',
        type: 'line',
        source: 'routes',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#e6333b',
          'line-width': ['interpolate', ['linear'], ['zoom'], 9, 2.3, 13, 3.4, 17, 5],
          'line-opacity': 0.98,
          'line-dasharray': [1.2, 1.1],
        },
      })

      const bounds = new maplibregl.LngLatBounds()
      routes.forEach((route) => route.coordinates.forEach((coordinate) => bounds.extend(coordinate)))
      map.fitBounds(bounds, { padding: { top: 80, right: 160, bottom: 120, left: 80 }, duration: 0 })
    })

    mapRef.current = map
    return () => {
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
      map.remove()
      mapRef.current = null
    }
  }, [routes])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = places.map((place) => {
      const element = document.createElement('button')
      element.type = 'button'
      element.className = `place-marker place-marker--${place.accent}`
      element.dataset.placeId = place.id
      element.setAttribute('aria-label', `打开地点：${place.title}`)
      element.innerHTML = `<span class="place-marker__pin"></span><span class="place-marker__label">${place.title}</span>`
      element.addEventListener('mouseenter', () => onHoverPlace(place.id))
      element.addEventListener('mouseleave', () => onHoverPlace(null))
      element.addEventListener('focus', () => onHoverPlace(place.id))
      element.addEventListener('blur', () => onHoverPlace(null))
      element.addEventListener('click', () => onSelectPlace(place.id))

      return new maplibregl.Marker({ element, anchor: 'bottom' })
        .setLngLat(place.coordinates)
        .addTo(map)
    })

    return () => {
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
    }
  }, [places, onHoverPlace, onSelectPlace])

  useEffect(() => {
    document.querySelectorAll<HTMLElement>('.place-marker').forEach((element) => {
      const id = element.dataset.placeId
      element.classList.toggle('is-active', id === activePlaceId)
      element.classList.toggle('is-hovered', id === hoveredPlaceId)
    })
  }, [activePlaceId, hoveredPlaceId])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !activePlaceId) return
    const place = places.find((candidate) => candidate.id === activePlaceId)
    if (place) map.easeTo({ center: place.coordinates, duration: 650, offset: [-100, 0] })
  }, [activePlaceId, places])

  return <div className="map-view" ref={mapContainerRef} aria-label="苏州路线地图" />
}

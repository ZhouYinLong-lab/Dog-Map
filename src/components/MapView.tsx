import { useEffect, useRef, useState } from 'react'
import maplibregl, { type Map } from 'maplibre-gl'
import type { Place, Route } from '../types/content'
import { getRouteColor, getRouteColorMap } from '../map/routePalette'
import { resolveMapStyle } from '../map/mapStyles'

type MapViewProps = {
  places: Place[]
  routes: Route[]
  activePlaceId: string | null
  hoveredPlaceId: string | null
  onHoverPlace: (placeId: string | null) => void
  onSelectPlace: (placeId: string) => void
}

function routeFeatureCollection(data: Route[]) {
  return {
    type: 'FeatureCollection' as const,
    features: data.map((item, index) => ({
      type: 'Feature' as const,
      properties: { id: item.id, title: item.title, color: getRouteColor(index) },
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
  const [mapReady, setMapReady] = useState(0)

  useEffect(() => {
    if (!mapContainerRef.current) return

    let disposed = false
    let map: Map | null = null

    void resolveMapStyle().then(({ style, mode }) => {
      if (disposed || !mapContainerRef.current) return

      map = new maplibregl.Map({
        container: mapContainerRef.current,
        style,
        center: [120.68, 31.3],
        zoom: 10.8,
        pitch: mode === 'vector' ? 48 : 0,
        bearing: mode === 'vector' ? -12 : 0,
        minZoom: 9,
        maxZoom: 18,
        canvasContextAttributes: { antialias: mode === 'vector' },
        attributionControl: false,
      })

      mapContainerRef.current.dataset.mapMode = mode
      mapContainerRef.current.parentElement?.setAttribute('data-map-mode', mode)
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right')
      map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left')

      map.on('load', () => {
        if (!map || disposed) return

        if (mode === 'vector' && map.getSource('openmaptiles')) {
          if (map.getLayer('building')) {
            map.setPaintProperty('building', 'fill-color', '#242a31')
            map.setPaintProperty('building', 'fill-opacity', 0.78)
          }

          if (!map.getLayer('building-3d')) {
            const firstSymbolLayer = map.getStyle().layers?.find((layer) => layer.type === 'symbol')
            map.addLayer({
              id: 'building-3d',
              type: 'fill-extrusion',
              source: 'openmaptiles',
              'source-layer': 'building',
              minzoom: 12.5,
              paint: {
                'fill-extrusion-base': ['get', 'render_min_height'],
                'fill-extrusion-color': '#303943',
                'fill-extrusion-height': ['get', 'render_height'],
                'fill-extrusion-opacity': 0.78,
              },
            }, firstSymbolLayer?.id)
          } else {
            map.setPaintProperty('building-3d', 'fill-extrusion-color', '#303943')
            map.setPaintProperty('building-3d', 'fill-extrusion-opacity', 0.78)
          }
        }

        map.addSource('routes', {
          type: 'geojson',
          data: routeFeatureCollection(routes),
        })

        map.addLayer({
          id: 'route-ink',
          type: 'line',
          source: 'routes',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': '#0a0a0a',
            'line-width': ['interpolate', ['linear'], ['zoom'], 9, 11, 13, 16, 17, 23],
            'line-opacity': 0.94,
          },
        })

        map.addLayer({
          id: 'route-core',
          type: 'line',
          source: 'routes',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': ['get', 'color'],
            'line-width': ['interpolate', ['linear'], ['zoom'], 9, 5.5, 13, 7.5, 17, 10],
            'line-opacity': 0.98,
          },
        })

        map.addLayer({
          id: 'route-highlight',
          type: 'line',
          source: 'routes',
          layout: { 'line-cap': 'butt', 'line-join': 'round' },
          paint: {
            'line-color': '#f2eadc',
            'line-width': ['interpolate', ['linear'], ['zoom'], 9, 1, 13, 1.5, 17, 2],
            'line-opacity': 0.72,
            'line-dasharray': [0.25, 2.25],
          },
        })

        const bounds = new maplibregl.LngLatBounds()
        routes.forEach((route) => route.coordinates.forEach((coordinate) => bounds.extend(coordinate)))
        map.fitBounds(bounds, { padding: { top: 80, right: 160, bottom: 120, left: 80 }, duration: 0 })
        setMapReady((current) => current + 1)
      })

      mapRef.current = map
    })

    return () => {
      disposed = true
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
      map?.remove()
      mapRef.current = null
    }
  }, [routes])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return

    const routeColors = getRouteColorMap(routes)
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = places.map((place) => {
      const element = document.createElement('button')
      element.type = 'button'
      element.className = `place-marker place-marker--${place.accent}`
      element.dataset.placeId = place.id
      element.style.setProperty('--route-color', routeColors[place.routeId] ?? getRouteColor(0))
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
  }, [mapReady, places, routes, onHoverPlace, onSelectPlace])

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

import { useEffect, useRef, useState } from 'react'
import maplibregl, { type GeoJSONSource, type Map } from 'maplibre-gl'
import type { Place, Route } from '../types/content'
import { getRouteColor, getRouteColorMap } from '../map/routePalette'
import { resolveMapStyle } from '../map/mapStyles'
import { configureCityScene } from '../map/cityScene'
import { artworkDataUri } from '../map/artwork'

const njuSuzhouCampus: [number, number] = [120.387037, 31.351239]

type MapViewProps = {
  places: Place[]
  routes: Route[]
  activePlaceId: string | null
  hoveredPlaceId: string | null
  activeRouteId: string | null
  onHoverPlace: (placeId: string | null) => void
  onSelectPlace: (placeId: string) => void
  onSelectRoute: (routeId: string) => void
}

function routeFeatureCollection(data: Route[], colorOffset = 0) {
  return {
    type: 'FeatureCollection' as const,
    features: data.map((item, index) => ({
      type: 'Feature' as const,
      properties: { id: item.id, title: item.title, color: getRouteColor(index + colorOffset) },
      geometry: {
        type: 'LineString' as const,
        coordinates: item.coordinates,
      },
    })),
  }
}

function markerScaleForZoom(zoom: number) {
  return Math.min(1.55, Math.max(0.42, 2 ** (zoom - 13.2)))
}

function routePointAt(route: Route | undefined, progress: number) {
  if (!route || route.coordinates.length === 0) {
    return null
  }

  const segments = route.coordinates.slice(1).map((coordinate, index) => {
    const start = route.coordinates[index]
    const dx = coordinate[0] - start[0]
    const dy = coordinate[1] - start[1]
    return { start, coordinate, length: Math.hypot(dx, dy) }
  })
  const totalLength = segments.reduce((total, segment) => total + segment.length, 0)
  let distance = totalLength * Math.min(1, Math.max(0, progress))
  let point = route.coordinates[0]

  for (const segment of segments) {
    if (distance <= segment.length) {
      const ratio = segment.length === 0 ? 0 : distance / segment.length
      point = [
        segment.start[0] + (segment.coordinate[0] - segment.start[0]) * ratio,
        segment.start[1] + (segment.coordinate[1] - segment.start[1]) * ratio,
      ]
      break
    }
    distance -= segment.length
    point = segment.coordinate
  }

  return point
}

function routeProgressFeature(route: Route | undefined, progress: number, color = getRouteColor(0)) {
  if (!route || route.coordinates.length === 0) {
    return { type: 'FeatureCollection' as const, features: [] }
  }

  const point = routePointAt(route, progress) ?? route.coordinates[0]
  const coordinates = route.coordinates.slice(0)
  const remaining = Math.min(1, Math.max(0, progress))
  const segmentCount = Math.max(1, coordinates.length - 1)
  const segmentProgress = remaining * segmentCount
  const segmentIndex = Math.min(coordinates.length - 2, Math.floor(segmentProgress))
  const segmentRatio = segmentProgress - segmentIndex
  coordinates.splice(segmentIndex + 1)
  if (coordinates.length > 1 || progress > 0) coordinates.push(point)

  return {
    type: 'FeatureCollection' as const,
    features: [{
      type: 'Feature' as const,
      properties: { id: route.id, title: route.title, color, progress: segmentRatio },
      geometry: { type: 'LineString' as const, coordinates },
    }],
  }
}

export function MapView({
  places,
  routes,
  activePlaceId,
  hoveredPlaceId,
  activeRouteId,
  onHoverPlace,
  onSelectPlace,
  onSelectRoute,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const markerElementsRef = useRef<HTMLElement[]>([])
  const routeCameraInitializedRef = useRef(false)
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
        center: njuSuzhouCampus,
        zoom: mode === 'vector' ? 13.2 : 11.4,
        pitch: mode === 'vector' ? 58 : 0,
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

        if (mode === 'vector') configureCityScene(map)

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

        const activeRoute = routes.find((route) => route.id === activeRouteId)
        const activeRouteIndex = activeRoute ? routes.indexOf(activeRoute) : 0
        map.addSource('route-active', {
          type: 'geojson',
          data: activeRoute ? routeFeatureCollection([activeRoute], activeRouteIndex) : { type: 'FeatureCollection' as const, features: [] },
        })
        map.addLayer({
          id: 'route-active-ink',
          type: 'line',
          source: 'route-active',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': '#090909',
            'line-width': ['interpolate', ['linear'], ['zoom'], 9, 14, 13, 19, 17, 26],
            'line-opacity': 0.92,
          },
        })
        map.addLayer({
          id: 'route-active-core',
          type: 'line',
          source: 'route-active',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': ['get', 'color'],
            'line-width': ['interpolate', ['linear'], ['zoom'], 9, 8, 13, 11, 17, 15],
            'line-opacity': 1,
          },
        })
        map.addLayer({
          id: 'route-active-highlight',
          type: 'line',
          source: 'route-active',
          layout: { 'line-cap': 'butt', 'line-join': 'round' },
          paint: {
            'line-color': '#fff8ea',
            'line-width': ['interpolate', ['linear'], ['zoom'], 9, 1.5, 13, 2, 17, 2.5],
            'line-opacity': 0.9,
            'line-dasharray': [0.2, 2.1],
          },
        })
        map.on('click', 'route-core', (event) => {
          const routeId = event.features?.[0]?.properties?.id
          if (typeof routeId === 'string') onSelectRoute(routeId)
        })
        map.on('mouseenter', 'route-core', () => { map!.getCanvas().style.cursor = 'pointer' })
        map.on('mouseleave', 'route-core', () => { map!.getCanvas().style.cursor = '' })

        setMapReady((current) => current + 1)
      })

      mapRef.current = map
    })

    return () => {
      disposed = true
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
      markerElementsRef.current = []
      map?.remove()
      mapRef.current = null
    }
  }, [onSelectRoute, routes])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return

    const activeRoute = routes.find((route) => route.id === activeRouteId)
    const activeSource = map.getSource('route-active') as GeoJSONSource | undefined
    if (!activeSource) return

    const activeRouteIndex = activeRoute ? routes.indexOf(activeRoute) : 0
    const activeRouteColor = getRouteColor(activeRouteIndex)
    const shouldMoveCamera = routeCameraInitializedRef.current
    routeCameraInitializedRef.current = true
    activeSource.setData(routeProgressFeature(activeRoute, 0, activeRouteColor))

    if (activeRoute && shouldMoveCamera) {
      const bounds = new maplibregl.LngLatBounds()
      activeRoute.coordinates.forEach((coordinate) => bounds.extend(coordinate))
      map.fitBounds(bounds, { padding: { top: 100, right: 180, bottom: 150, left: 100 }, duration: 900 })
    }

    let frame = 0
    const startedAt = performance.now()
    const duration = 5200
    let lastCameraAt = startedAt
    const animate = (now: number) => {
      const progress = ((now - startedAt) % duration) / duration
      activeSource.setData(routeProgressFeature(activeRoute, progress, activeRouteColor))
      if (activeRoute && shouldMoveCamera && now - lastCameraAt > 180) {
        const point = routePointAt(activeRoute, progress)
        if (point) map.easeTo({ center: point, duration: 180, essential: true })
        lastCameraAt = now
      }
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frame)
  }, [activeRouteId, mapReady, routes])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return

    const routeColors = getRouteColorMap(routes)
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = places.map((place) => {
      const element = document.createElement('button')
      element.type = 'button'
      element.className = `place-marker place-marker--${place.accent}${place.markerImage ? ' place-marker--sticker' : ''}`
      element.dataset.placeId = place.id
      element.style.visibility = activePlaceId ? 'hidden' : 'visible'
      element.style.setProperty('--route-color', routeColors[place.routeId] ?? getRouteColor(0))
      element.setAttribute('aria-label', `打开地点：${place.title}`)
      element.innerHTML = `<img class="place-marker__art" src="${place.markerImage ?? artworkDataUri(place.id, place.accent, place.art)}" alt="" aria-hidden="true" />`
      element.addEventListener('mouseenter', () => onHoverPlace(place.id))
      element.addEventListener('mouseleave', () => onHoverPlace(null))
      element.addEventListener('focus', () => onHoverPlace(place.id))
      element.addEventListener('blur', () => onHoverPlace(null))
      element.addEventListener('click', () => onSelectPlace(place.id))

      return new maplibregl.Marker({ element, anchor: 'bottom' })
        .setLngLat(place.coordinates)
        .addTo(map)
    })
    markerElementsRef.current = places.map((place) => document.querySelector<HTMLElement>(`.place-marker[data-place-id="${place.id}"]`)).filter((element): element is HTMLElement => Boolean(element))
    const updateMarkerScale = () => {
      const zoomScale = markerScaleForZoom(map.getZoom())
      markerElementsRef.current.forEach((element) => {
        const scale = zoomScale * (element.classList.contains('place-marker--sticker') ? 1.12 : 1)
        element.style.setProperty('--marker-scale', `${scale}`)
        element.style.setProperty('--marker-hover-scale', `${scale * 1.1}`)
      })
    }
    updateMarkerScale()
    map.on('zoom', updateMarkerScale)

    return () => {
      map.off('zoom', updateMarkerScale)
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
      markerElementsRef.current = []
    }
  }, [activePlaceId, mapReady, places, routes, onHoverPlace, onSelectPlace])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return

    const visibility = activePlaceId ? 'none' : 'visible'
    ;[
      'route-ink',
      'route-core',
      'route-highlight',
      'route-active-ink',
      'route-active-core',
      'route-active-highlight',
    ].forEach((layerId) => {
      if (map.getLayer(layerId)) map.setLayoutProperty(layerId, 'visibility', visibility)
    })
    markerElementsRef.current.forEach((element) => {
      element.style.visibility = visibility
    })
  }, [activePlaceId, mapReady])

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
    if (place) map.easeTo({ center: place.coordinates, zoom: Math.max(map.getZoom(), 13.2), pitch: 58, duration: 650, offset: [-100, 0] })
  }, [activePlaceId, places])

  return <div className="map-view" ref={mapContainerRef} aria-label="苏州路线地图" />
}

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

function markerScaleForZoom(zoom: number, referenceZoom: number) {
  return Math.min(1.35, 2 ** (zoom - referenceZoom))
}

function markerOffsetsForClusters(map: Map, places: Place[], markerScale: number, compactViewport: boolean) {
  const projected = places.map((place) => map.project(place.coordinates))
  const visualSize = 168 * markerScale
  const collisionDistance = Math.max(72, visualSize + 18)
  const spread = compactViewport ? Math.max(46, visualSize + 16) : Math.max(92, visualSize + 28)
  const visited = new Set<number>()
  const offsets = places.map((): [number, number] => [0, 0])

  places.forEach((_, index) => {
    if (visited.has(index)) return

    const cluster: number[] = []
    const queue = [index]
    visited.add(index)

    while (queue.length > 0) {
      const current = queue.shift()!
      cluster.push(current)
      places.forEach((__, candidate) => {
        if (visited.has(candidate)) return
        const distance = projected[current].dist(projected[candidate])
        if (distance <= collisionDistance) {
          visited.add(candidate)
          queue.push(candidate)
        }
      })
    }

    if (cluster.length < 2) return

    const columns = Math.ceil(Math.sqrt(cluster.length))
    cluster.forEach((placeIndex, clusterIndex) => {
      const column = clusterIndex % columns
      const row = Math.floor(clusterIndex / columns)
      offsets[placeIndex] = [
        (column - (columns - 1) / 2) * spread,
        (row - (Math.ceil(cluster.length / columns) - 1) / 2) * spread,
      ]
    })
  })

  return offsets
}

function fitAllPlaces(map: Map, places: Place[]) {
  if (places.length < 2) return

  const bounds = new maplibregl.LngLatBounds()
  places.forEach((place) => bounds.extend(place.coordinates))
  const compactViewport = map.getContainer().clientWidth <= 520
  map.fitBounds(bounds, {
    padding: compactViewport
      ? { top: 80, right: 30, bottom: 120, left: 30 }
      : { top: 120, right: 220, bottom: 150, left: 140 },
    maxZoom: 12.2,
    duration: 0,
  })
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
  const markerReferenceZoomRef = useRef(13.2)
  const routeCameraInitializedRef = useRef(false)
  const [mapReady, setMapReady] = useState(0)

  useEffect(() => {
    if (!mapContainerRef.current) return

    let disposed = false
    let map: Map | null = null

    void resolveMapStyle().then(({ style, mode }) => {
      if (disposed || !mapContainerRef.current) return

      const initialZoom = mode === 'vector' ? 13.2 : 11.4
      markerReferenceZoomRef.current = initialZoom

      map = new maplibregl.Map({
        container: mapContainerRef.current,
        style,
        center: njuSuzhouCampus,
        zoom: initialZoom,
        pitch: mode === 'vector' ? 58 : 0,
        bearing: 0,
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

        fitAllPlaces(map, places)
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
  }, [onSelectRoute, places, routes])

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
    const markerAnchors = places.map((place) => {
      const anchor = document.createElement('div')
      anchor.className = 'place-marker-anchor'
      const element = document.createElement('button')
      element.type = 'button'
      element.className = `place-marker place-marker--${place.accent}${place.markerImage ? ' place-marker--sticker' : ''}`
      element.dataset.placeId = place.id
      element.style.visibility = 'visible'
      element.style.setProperty('--route-color', (place.routeId ? routeColors[place.routeId] : undefined) ?? getRouteColor(0))
      element.setAttribute('aria-label', `打开地点：${place.title}`)
      element.innerHTML = `<span class="place-marker__visual"><img class="place-marker__art" src="${place.markerImage ?? artworkDataUri(place.id, place.accent, place.art)}" alt="" aria-hidden="true" /></span>`
      element.addEventListener('mouseenter', () => onHoverPlace(place.id))
      element.addEventListener('mouseleave', () => onHoverPlace(null))
      element.addEventListener('focus', () => onHoverPlace(place.id))
      element.addEventListener('blur', () => onHoverPlace(null))
      element.addEventListener('click', () => onSelectPlace(place.id))
      anchor.append(element)

      return { anchor, element }
    })
    markersRef.current = places.map((place, index) => {
      return new maplibregl.Marker({ element: markerAnchors[index].anchor, anchor: 'bottom' })
        .setLngLat(place.coordinates)
        .addTo(map)
    })
    markerElementsRef.current = markerAnchors.map(({ element }) => element)
    const updateMarkerLayout = () => {
      const compactViewport = map.getContainer().clientWidth <= 520
      const zoomScale = Math.max(compactViewport ? 0.08 : 0, markerScaleForZoom(map.getZoom(), markerReferenceZoomRef.current))
      const offsets = markerOffsetsForClusters(map, places, zoomScale, compactViewport)
      markerElementsRef.current.forEach((element) => {
        const scale = zoomScale
        element.style.setProperty('--marker-scale', `${scale}`)
        element.style.setProperty('--marker-hover-scale', `${scale * 1.1}`)
      })
      markersRef.current.forEach((marker, index) => marker.setOffset(offsets[index]))
    }
    updateMarkerLayout()
    map.on('zoom', updateMarkerLayout)
    map.on('move', updateMarkerLayout)

    return () => {
      map.off('zoom', updateMarkerLayout)
      map.off('move', updateMarkerLayout)
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
      markerElementsRef.current = []
    }
  }, [mapReady, places, routes, onHoverPlace, onSelectPlace])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady || !activePlaceId) return
    const place = places.find((candidate) => candidate.id === activePlaceId)
    if (place) {
      map.easeTo({
        center: place.coordinates,
        zoom: Math.max(map.getZoom(), 12.2),
        pitch: 58,
        duration: 650,
        offset: [-100, 0],
      })
    }
  }, [activePlaceId, mapReady, places])

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
      element.style.visibility = 'visible'
    })
  }, [activePlaceId, mapReady])

  useEffect(() => {
    document.querySelectorAll<HTMLElement>('.place-marker').forEach((element) => {
      const id = element.dataset.placeId
      element.classList.toggle('is-active', id === activePlaceId)
      element.classList.toggle('is-hovered', id === hoveredPlaceId)
    })
  }, [activePlaceId, hoveredPlaceId])

  return <div className="map-view" ref={mapContainerRef} aria-label="苏州路线地图" />
}

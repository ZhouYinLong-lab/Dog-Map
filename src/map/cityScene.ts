import type { Map } from 'maplibre-gl'

export const terrainSourceUrl = import.meta.env.VITE_TERRAIN_SOURCE_URL?.trim()
  || 'https://tiles.mapterhorn.com/tilejson.json'

function setPaintIfLayer(map: Map, layerId: string, property: string, value: unknown) {
  if (map.getLayer(layerId)) map.setPaintProperty(layerId, property, value)
}

function addBuildingExtrusion(map: Map) {
  if (!map.getSource('openmaptiles') || map.getLayer('building-3d')) return
  const firstSymbolLayer = map.getStyle().layers?.find((layer) => layer.type === 'symbol')
  map.addLayer({
    id: 'building-3d',
    type: 'fill-extrusion',
    source: 'openmaptiles',
    'source-layer': 'building',
    minzoom: 10.5,
    paint: {
      'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
      'fill-extrusion-color': '#2c3f4b',
      'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 4],
      'fill-extrusion-opacity': 0.86,
      'fill-extrusion-vertical-gradient': true,
    },
  }, firstSymbolLayer?.id)
}

function addTerrain(map: Map) {
  if (!map.getSource('terrain-dem')) {
    map.addSource('terrain-dem', {
      type: 'raster-dem',
      url: terrainSourceUrl,
      tileSize: 512,
      maxzoom: 14,
      encoding: 'terrarium',
    })
  }

  map.setTerrain({ source: 'terrain-dem', exaggeration: 1.35 })
}

export function configureCityScene(map: Map) {
  if (!map.getSource('openmaptiles')) return

  setPaintIfLayer(map, 'background', 'background-color', '#1b2a34')
  setPaintIfLayer(map, 'water', 'fill-color', '#3c5965')
  setPaintIfLayer(map, 'water', 'fill-opacity', 0.92)
  setPaintIfLayer(map, 'landuse_residential', 'fill-color', '#273944')
  setPaintIfLayer(map, 'landuse_residential', 'fill-opacity', 0.76)
  setPaintIfLayer(map, 'landuse_park', 'fill-color', '#245348')
  setPaintIfLayer(map, 'landuse_park', 'fill-opacity', 0.76)
  setPaintIfLayer(map, 'landcover_wood', 'fill-color', '#1d4a40')
  setPaintIfLayer(map, 'landcover_wood', 'fill-opacity', 0.8)
  setPaintIfLayer(map, 'building', 'fill-color', '#263944')
  setPaintIfLayer(map, 'building', 'fill-opacity', 0.58)

  setPaintIfLayer(map, 'highway_minor', 'line-color', '#679797')
  setPaintIfLayer(map, 'highway_minor', 'line-opacity', 0.74)
  setPaintIfLayer(map, 'highway_major_casing', 'line-color', '#1d3038')
  setPaintIfLayer(map, 'highway_major_casing', 'line-opacity', 0.96)
  setPaintIfLayer(map, 'highway_major_inner', 'line-color', '#a6c9b9')
  setPaintIfLayer(map, 'highway_major_inner', 'line-opacity', 0.96)
  setPaintIfLayer(map, 'highway_motorway_casing', 'line-color', '#172831')
  setPaintIfLayer(map, 'highway_motorway_inner', 'line-color', '#d7e4cb')
  setPaintIfLayer(map, 'highway_motorway_inner', 'line-opacity', 1)
  setPaintIfLayer(map, 'railway', 'line-color', '#7199a0')
  setPaintIfLayer(map, 'railway', 'line-opacity', 0.7)

  for (const layerId of ['place_city', 'place_city_large', 'place_town', 'place_suburb', 'highway_name_other', 'highway_name_motorway', 'water_name']) {
    setPaintIfLayer(map, layerId, 'text-color', '#d3dfd6')
    setPaintIfLayer(map, layerId, 'text-halo-color', '#1a2831')
    setPaintIfLayer(map, layerId, 'text-halo-width', 1.2)
  }

  addBuildingExtrusion(map)
  addTerrain(map)
}

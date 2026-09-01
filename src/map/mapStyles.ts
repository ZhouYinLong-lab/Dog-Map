import type { StyleSpecification } from 'maplibre-gl'

export const vectorMapStyleUrl = import.meta.env.VITE_MAP_STYLE_URL?.trim() || 'https://tiles.openfreemap.org/styles/dark'

export const rasterFallbackStyle: StyleSpecification = {
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
        'raster-brightness-max': 0.58,
        'raster-opacity': 0.72,
      },
    },
  ],
}

export async function resolveMapStyle() {
  try {
    const response = await fetch(vectorMapStyleUrl, { method: 'GET', cache: 'force-cache' })
    if (!response.ok) throw new Error(`Map style request failed: ${response.status}`)
    // Pass the already downloaded style object to MapLibre so it does not
    // request the same style URL a second time during map initialization.
    const style = await response.json() as StyleSpecification
    return { style, mode: 'vector' as const }
  } catch {
    return { style: rasterFallbackStyle, mode: 'raster' as const }
  }
}

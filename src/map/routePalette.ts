import type { Route } from '../types/content'

// The palette is deliberately high-contrast: routes must remain separable
// against the dark map even when several lines overlap near the campus.
export const routePalette = ['#e6333b', '#00d6c8', '#f1c743', '#7b61ff', '#ff6b3d', '#f45b9a', '#b8ff00']

export function getRouteColor(index: number) {
  return routePalette[((index % routePalette.length) + routePalette.length) % routePalette.length]
}

export function getRouteColorMap(routes: Route[]) {
  return Object.fromEntries(routes.map((route, index) => [route.id, getRouteColor(index)]))
}

import placesData from './places.json'
import routesData from './routes.json'
import type { Place, Route } from '../types/content'

export const places = placesData as unknown as Place[]
export const routes = routesData as unknown as Route[]

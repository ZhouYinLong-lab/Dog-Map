export type Coordinates = [number, number]

export type MediaItem = {
  type: 'image' | 'video'
  src: string
  poster?: string
  alt: string
  caption?: string
}

export type ArtworkSpec = {
  seed?: string
  variant?: 'burst' | 'slash' | 'orbit'
}

export type Place = {
  id: string
  title: string
  subtitle: string
  date: string
  coordinates: Coordinates
  routeId: string
  accent: 'red' | 'yellow'
  description: string
  media: MediaItem[]
  markerImage?: string
  art?: ArtworkSpec
}

export type Route = {
  id: string
  title: string
  mode: string
  coordinates: Coordinates[]
  art?: ArtworkSpec
}

export type Coordinates = [number, number]

export type MediaItem = {
  type: 'image' | 'video'
  src: string
  poster?: string
  alt: string
  caption?: string
}

export type Shop = {
  id: string
  name: string
  category: string
  summary: string
  description: string
  tags?: string[]
  media: MediaItem[]
}

export type ArtworkSpec = {
  seed?: string
  variant?: 'burst' | 'slash' | 'orbit'
}

export type Place = {
  id: string
  title: string
  englishTitle?: string
  subtitle: string
  date: string
  coordinates: Coordinates
  coordinateSource: 'photo-exif' | 'map-poi'
  coordinateReference: string
  routeId?: string
  accent: 'red' | 'yellow'
  description: string
  media: MediaItem[]
  shops?: Shop[]
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

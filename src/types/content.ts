export type Coordinates = [number, number]

export type MediaItem = {
  type: 'image' | 'video'
  src: string
  poster?: string
  alt: string
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
}

export type Route = {
  id: string
  title: string
  mode: string
  coordinates: Coordinates[]
}

export type LocationId = string

export type Connection =
  | 'triangle'
  | 'square'
  | 'circle'
  | 'star'
  | 'moon'
  | 'heart'
  | 'diamond'
  | 'cross'
  | 'pentagram'
  | 'hexagram'

export type LocationCard = {
  id: LocationId
  name: string
  incomingConnection: Connection
  connections: Connection[]
  initialClues: number
  shroud: number
}

export function isConnected(
  location: LocationCard,
  otherLocation: LocationCard
): boolean {
  return location.connections.includes(otherLocation.incomingConnection)
}

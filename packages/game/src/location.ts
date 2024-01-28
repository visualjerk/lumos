export type Connection = 'triangle' | 'square' | 'circle' | 'star' | 'moon'

export type LocationId = string

export type Location = {
  name: string
  id: LocationId
  incomingConnection: Connection
  connections: Connection[]
}

export function isConnected(
  location: Location,
  otherLocation: Location
): boolean {
  return location.connections.includes(otherLocation.incomingConnection)
}

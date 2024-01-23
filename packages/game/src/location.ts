export type Connection = 'triangle' | 'rectangle' | 'circle' | 'star' | 'moon'

export type Location = {
  name: string
  incomingConnection: Connection
  connections: Connection[]
}

export function isConnected(
  location: Location,
  otherLocation: Location
): boolean {
  return location.connections.includes(otherLocation.incomingConnection)
}

import { describe, expect, it } from 'vitest'
import { LocationCard, isConnected } from './location-card'

describe('Location', () => {
  it('isConnected', () => {
    const firstLocation: LocationCard = {
      id: '1',
      name: 'Great Hall',
      incomingConnection: 'circle',
      connections: ['moon', 'square'],
      initialClues: 2,
      shroud: 3,
    }
    const secondLocation: LocationCard = {
      id: '2',
      name: 'Second Floor',
      incomingConnection: 'moon',
      connections: ['circle', 'square'],
      initialClues: 2,
      shroud: 3,
    }
    const thirdLocation: LocationCard = {
      id: '3',
      name: 'Room 42',
      incomingConnection: 'star',
      connections: ['circle'],
      initialClues: 2,
      shroud: 3,
    }

    expect(isConnected(firstLocation, secondLocation)).toBe(true)
    expect(isConnected(firstLocation, thirdLocation)).toBe(false)
    expect(isConnected(thirdLocation, firstLocation)).toBe(true)
  })
})

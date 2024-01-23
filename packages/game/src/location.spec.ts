import { describe, expect, it } from 'vitest'
import { Location, isConnected } from './location'

describe('Location', () => {
  it('isConnected', () => {
    const firstLocation: Location = {
      name: 'Great Hall',
      incomingConnection: 'circle',
      connections: ['moon', 'rectangle'],
    }
    const secondLocation: Location = {
      name: 'Second Floor',
      incomingConnection: 'moon',
      connections: ['circle', 'rectangle'],
    }
    const thirdLocation: Location = {
      name: 'Room 42',
      incomingConnection: 'star',
      connections: ['circle'],
    }

    expect(isConnected(firstLocation, secondLocation)).toBe(true)
    expect(isConnected(firstLocation, thirdLocation)).toBe(false)
    expect(isConnected(thirdLocation, firstLocation)).toBe(true)
  })
})

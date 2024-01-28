import { describe, expect, it } from 'vitest'
import { LocationCard } from './card'
import { Game } from './game'

const FIRST_LOCATION: LocationCard = {
  id: '1',
  name: 'Great Hall',
  incomingConnection: 'circle',
  connections: ['moon'],
}

const SECOND_LOCATION: LocationCard = {
  id: '2',
  name: 'Second Floor',
  incomingConnection: 'moon',
  connections: ['circle', 'square'],
}

const THIRD_LOCATION: LocationCard = {
  id: '3',
  name: 'Second Floor',
  incomingConnection: 'square',
  connections: ['moon'],
}

const INVESTIGATOR = {
  name: 'Bob',
  baseStats: {
    strength: 1,
    intelligence: 1,
    agility: 1,
  },
  health: 5,
}

describe('Game', () => {})

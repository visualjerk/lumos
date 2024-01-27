import { describe, expect, it } from 'vitest'
import { Location } from './location'
import { Game } from './game'

const FIRST_LOCATION: Location = {
  id: '1',
  name: 'Great Hall',
  incomingConnection: 'circle',
  connections: ['moon'],
}

const SECOND_LOCATION: Location = {
  id: '2',
  name: 'Second Floor',
  incomingConnection: 'moon',
  connections: ['circle', 'rectangle'],
}

const THIRD_LOCATION: Location = {
  id: '3',
  name: 'Second Floor',
  incomingConnection: 'rectangle',
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

describe('Game', () => {
  it('adds location', () => {
    const game = new Game()
    game.addLocation(FIRST_LOCATION, { x: 1, y: 1 })
    expect(game.locations).toContain(FIRST_LOCATION)
  })

  it('adds investigator', () => {
    const game = new Game()
    game.addLocation(FIRST_LOCATION, { x: 2, y: 1 })
    game.addInvestigator(INVESTIGATOR, FIRST_LOCATION)

    expect(game.investigators).toContain(INVESTIGATOR)
    expect(game.investigatorStates).toContainEqual({
      investigator: INVESTIGATOR,
      location: FIRST_LOCATION,
      currentHealth: INVESTIGATOR.health,
    })
  })

  it('moves investigator', () => {
    const game = new Game()
    game.addLocation(FIRST_LOCATION, { x: 1, y: 1 })
    game.addLocation(SECOND_LOCATION, { x: 2, y: 1 })
    game.addInvestigator(INVESTIGATOR, FIRST_LOCATION)

    game.moveInvestigator(INVESTIGATOR, SECOND_LOCATION)

    expect(game.investigatorStates).toContainEqual({
      investigator: INVESTIGATOR,
      location: SECOND_LOCATION,
      currentHealth: INVESTIGATOR.health,
    })
  })

  it('throws when moving investigator to not connected location', () => {
    const game = new Game()
    game.addLocation(FIRST_LOCATION, { x: 1, y: 1 })
    game.addLocation(THIRD_LOCATION, { x: 2, y: 1 })
    game.addInvestigator(INVESTIGATOR, FIRST_LOCATION)

    expect(() =>
      game.moveInvestigator(INVESTIGATOR, THIRD_LOCATION)
    ).toThrowError('Locations are not connected')
  })
})

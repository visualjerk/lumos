import { beforeEach, describe, expect, it } from 'vitest'
import { Game } from '../game'
import { createInvestigatorPhase } from '../investigator'
import { Aisle2, Aisle3, GameTestUtils, createGameTestUtils } from '../test'

describe('InvestigatorPhase', () => {
  let t: GameTestUtils
  let game: Game

  beforeEach(() => {
    t = createGameTestUtils(createInvestigatorPhase)
    game = t.game
    t.expectPhase('investigator')
  })

  it('can end phase', () => {
    t.executeAction({ type: 'end' })
    t.expectPhase('end')
  })

  it('can move to location', () => {
    const locationId = Aisle3.id
    t.executeAction({ type: 'move', locationId })
    expect(game.context.investigatorStates.get('1')?.currentLocation).toBe(
      locationId
    )
  })

  it('cannot move to unconnected location', () => {
    const locationId = Aisle2.id
    t.expectNoAction({ type: 'move', locationId })
  })

  it('can collect clue at location', () => {
    const investigatorState = game.context.investigatorStates.get('1')!
    const currentLocationId =
      game.context.investigatorStates.get('1')?.currentLocation!
    const locationState = game.context.locationStates.get(currentLocationId)!

    expect(investigatorState.clues).toBe(0)
    expect(locationState.clues).toBe(3)

    t.executeAction({ type: 'investigate' })

    expect(investigatorState.clues).toBe(1)
    expect(locationState.clues).toBe(2)
  })

  it('cannot collect clue at location with no clues', () => {
    const currentLocationId =
      game.context.investigatorStates.get('1')?.currentLocation!
    const locationState = game.context.locationStates.get(currentLocationId)!

    locationState.clues = 0
    t.expectNoAction({ type: 'investigate' })
  })

  it('can draw card', () => {
    t.executeAction({ type: 'draw' })
    expect(game.context.investigatorStates.get('1')?.cardsInHand.length).toBe(1)
  })

  it('can not draw with empty deck', () => {
    game.context.investigatorStates.get('1')!.deck = []
    t.expectNoAction({ type: 'draw' })
  })
})

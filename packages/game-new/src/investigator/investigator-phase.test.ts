import { beforeEach, describe, expect, it } from 'vitest'
import { Game } from '../game'
import { createInvestigatorPhase } from '../investigator'
import { Aisle2, Aisle3, GameTestUtils, createGameTestUtils } from '../test'

describe('game', () => {
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
})

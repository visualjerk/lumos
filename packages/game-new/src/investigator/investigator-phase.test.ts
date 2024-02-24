import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Game } from '../game'
import { InvestigatorState, createInvestigatorPhase } from '../investigator'
import {
  Aisle2,
  Aisle3,
  GameTestUtils,
  createGameTestUtils,
  mockGetInvestigatorCard,
  mockSpinFateWheel,
} from '../test'

describe('InvestigatorPhase', () => {
  let t: GameTestUtils
  let game: Game
  let investigatorState: InvestigatorState

  beforeEach(() => {
    t = createGameTestUtils(createInvestigatorPhase)
    game = t.game
    investigatorState = game.context.investigatorStates.get('1')!
    t.expectPhase('investigator')

    mockSpinFateWheel({
      symbol: 1,
      modifySkillCheck: (n: number) => n,
    })
  })

  it('can end phase', () => {
    t.executeAction({ type: 'end' })
    t.expectPhase('upkeep')
  })

  it('investigator draws in upkeep', () => {
    t.executeAction({ type: 'end' })
    expect(investigatorState.cardsInHand.length).toBe(1)
  })

  it('ends investigator phase after 3 actions', () => {
    for (let i = 0; i < 3; i++) {
      t.executeAction({ type: 'draw' })
    }
    t.expectPhase('investigator')
    t.expectOnlyActions({ type: 'end' })
  })

  it('can move to location', () => {
    const locationId = Aisle3.id
    t.executeAction({ type: 'move', locationId })
    expect(investigatorState.currentLocation).toBe(locationId)
  })

  it('cannot move to unconnected location', () => {
    const locationId = Aisle2.id
    t.expectNoAction({ type: 'move', locationId })
  })

  it('can collect clue at location', () => {
    const currentLocationId = investigatorState.currentLocation!
    const locationState = game.context.locationStates.get(currentLocationId)!

    expect(investigatorState.clues).toBe(0)
    expect(locationState.clues).toBe(3)

    t.executeAction({ type: 'investigate' })
    t.executeAction({ type: 'commitSkillCheck' })
    t.executeAction({ type: 'endSkillCheck' })

    expect(investigatorState.clues).toBe(1)
    expect(locationState.clues).toBe(2)
  })

  it('cannot collect clue at location with no clues', () => {
    const currentLocationId = investigatorState.currentLocation!
    const locationState = game.context.locationStates.get(currentLocationId)!

    locationState.clues = 0
    t.expectNoAction({ type: 'investigate' })
  })

  it('can draw card', () => {
    t.executeAction({ type: 'draw' })
    expect(investigatorState.cardsInHand.length).toBe(1)
  })

  it('can not draw with empty deck', () => {
    investigatorState.deck = []
    t.expectNoAction({ type: 'draw' })
  })

  it('can play action card', () => {
    const cardId = 'ic1'
    mockGetInvestigatorCard({
      id: cardId,
      type: 'action',
      name: 'Test Card',
      description: '',
      skillModifier: {},
      action: { type: 'draw', amount: 2, target: 'self' },
    })
    investigatorState.cardsInHand = [cardId]

    t.executeAction({ type: 'play', cardIndex: 0 })

    expect(investigatorState.cardsInHand.length).toBe(2)
    expect(investigatorState.discardPile).toEqual([cardId])
  })

  it('cannot play action card with empty hand', () => {
    investigatorState.cardsInHand = []
    t.expectNoAction({ type: 'play' })
  })
})

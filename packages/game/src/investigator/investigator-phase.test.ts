import { beforeEach, describe, expect, it } from 'vitest'
import { Game } from '../game'
import { InvestigatorState, createInvestigatorPhase } from '../investigator'
import {
  SECOND_LOCATION,
  THIRD_LOCATION,
  FIRST_SCENE_CARD,
  SECOND_SCENE_CARD,
  GameTestUtils,
  createGameTestUtils,
  mockGetInvestigatorCard,
  mockSpinFateWheel,
  MOCK_INVESTIGATOR_ONE,
  mockGetEncounterCard,
  START_LOCATION,
  MOCK_INVESTIGATOR_TWO,
} from '../test'
import { EnemyCard, EnemyState } from '../enemy'

describe('InvestigatorPhase', () => {
  let t: GameTestUtils
  let game: Game
  let investigatorState: InvestigatorState

  beforeEach(() => {
    mockGetInvestigatorCard({
      id: 'ic-test-card',
      type: 'skill',
      name: 'Test Card',
      description: '',
      skillModifier: {},
    })

    t = createGameTestUtils(createInvestigatorPhase)
    game = t.game
    investigatorState = game.context.getInvestigatorState(
      MOCK_INVESTIGATOR_ONE.id
    )!
    t.expectPhase('investigator')

    mockSpinFateWheel({
      symbol: 1,
      modifySkillCheck: (n: number) => n,
    })
  })

  it('can end phase', () => {
    t.executeAction({ type: 'end' })
    t.executeAction({ type: 'end' })
    t.expectPhase('upkeep')
  })

  it('investigator draws in upkeep', () => {
    t.executeAction({ type: 'end' })
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

  it('each investigator can only perfom his actions', () => {
    t.expectNoAction({ type: 'end', controllerId: MOCK_INVESTIGATOR_TWO.id })
    t.executeAction({ type: 'end' })
    t.expectPhase('investigator')

    t.executeAction({ type: 'end', controllerId: MOCK_INVESTIGATOR_TWO.id })
    t.expectPhase('upkeep')
  })

  it('can move to location', () => {
    const locationId = SECOND_LOCATION.id
    t.executeAction({ type: 'move', locationId })
    expect(investigatorState.currentLocation).toBe(locationId)
  })

  it('cannot move to unconnected location', () => {
    const locationId = THIRD_LOCATION.id
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
    const cardId = 'ic-test-card'
    mockGetInvestigatorCard({
      id: cardId,
      type: 'action',
      name: 'Test Card',
      description: '',
      skillModifier: {},
      effect: { type: 'draw', amount: 2, target: 'self' },
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

  it('can advance scene with enough clues', () => {
    investigatorState.clues = FIRST_SCENE_CARD.clueTreshold
    t.executeAction({ type: 'solveScene' })
    t.expectPhase('advanceScene', 'investigator')

    t.executeAction({ type: 'advanceScene' })
    t.expectPhase('investigator')
    expect(investigatorState.clues).toBe(0)
  })

  it('cannot advance scene with too less clues', () => {
    investigatorState.clues = FIRST_SCENE_CARD.clueTreshold - 1
    t.expectNoAction({ type: 'solveScene' })
  })

  it('game ends after last scene was solved', () => {
    investigatorState.clues = FIRST_SCENE_CARD.clueTreshold
    t.executeAction({ type: 'solveScene' })
    t.executeAction({ type: 'advanceScene' })

    investigatorState.clues = SECOND_SCENE_CARD.clueTreshold
    t.executeAction({ type: 'solveScene' })
    t.executeAction({ type: 'advanceScene' })
    t.expectPhase('end', 'investigator')
  })

  describe('enemy has opportunity attack', () => {
    const ENEMY_CARD: EnemyCard = {
      id: 'ec-enemy',
      type: 'enemy',
      name: 'Enemy Card',
      description: '',
      attackDamage: 2,
      health: 3,
      strength: 2,
    }

    beforeEach(() => {
      mockGetEncounterCard(ENEMY_CARD)

      t.game.context.enemyStates.add(
        ENEMY_CARD,
        investigatorState.currentLocation,
        MOCK_INVESTIGATOR_ONE.id
      )
    })

    it('when drawing', () => {
      t.executeAction({ type: 'draw' })
      t.expectPhase('enemyAttackEffect', 'investigator')

      t.executeAction({ type: 'confirm' })
      expect(investigatorState.damage).toBe(ENEMY_CARD.attackDamage)
      t.expectPhase('investigator')
    })

    it('when moving', () => {
      t.executeAction({ type: 'move' })
      t.expectPhase('enemyAttackEffect', 'investigator')

      t.executeAction({ type: 'confirm' })
      expect(investigatorState.damage).toBe(ENEMY_CARD.attackDamage)
      t.expectPhase('investigator')
    })

    it('when investigating', () => {
      t.executeAction({ type: 'move' })
      t.expectPhase('enemyAttackEffect', 'investigator')

      t.executeAction({ type: 'confirm' })
      expect(investigatorState.damage).toBe(ENEMY_CARD.attackDamage)
      t.expectPhase('investigator')
    })

    it('when playing card', () => {
      const cardId = 'ic-test-card'
      mockGetInvestigatorCard({
        id: cardId,
        type: 'action',
        name: 'Test Card',
        description: '',
        skillModifier: {},
        effect: { type: 'draw', amount: 2, target: 'self' },
      })
      investigatorState.cardsInHand = [cardId]

      t.executeAction({ type: 'play' })
      t.expectPhase('enemyAttackEffect', 'investigator')

      t.executeAction({ type: 'confirm' })
      expect(investigatorState.damage).toBe(ENEMY_CARD.attackDamage)
      t.expectPhase('investigator')
    })
  })

  describe('enemy actions', () => {
    const ENEMY_CARD: EnemyCard = {
      id: 'ec-enemy',
      type: 'enemy',
      name: 'Enemy Card',
      description: '',
      attackDamage: 2,
      health: 2,
      strength: 2,
    }
    let enemyState: EnemyState

    beforeEach(() => {
      game.context.enemyStates.add(ENEMY_CARD, START_LOCATION.id)
      enemyState = game.context.getEnemyState(0)!
    })

    it('can attack enemy', () => {
      t.executeAction({ type: 'attack' })
      t.executeAction({ type: 'commitSkillCheck' })
      t.executeAction({ type: 'endSkillCheck' })

      expect(enemyState.damage).toBe(1)
    })

    it('can attack second enemy', () => {
      game.context.enemyStates.add(ENEMY_CARD, START_LOCATION.id)
      const secondEnemyState = game.context.getEnemyState(1)!

      t.executeAction({ type: 'attack', enemyIndex: 1 })
      t.executeAction({ type: 'commitSkillCheck' })
      t.executeAction({ type: 'endSkillCheck' })

      expect(secondEnemyState.damage).toBe(1)
    })

    it('cannot attack enemy at different location', () => {
      enemyState.location = SECOND_LOCATION.id
      t.expectNoAction({ type: 'attack' })
    })
  })
})

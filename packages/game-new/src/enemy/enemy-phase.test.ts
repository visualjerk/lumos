import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  GameTestUtils,
  MOCK_INVESTIGATOR_ONE,
  MOCK_INVESTIGATOR_TWO,
  createGameTestUtils,
  mockGetEncounterCard,
} from '../test'
import { InvestigatorState } from '../investigator'
import { EnemyCard, createEnemyPhase } from '.'

const CARD_ID = 'ec-trap'
const ENEMY_CARD: EnemyCard = {
  id: CARD_ID,
  type: 'enemy',
  name: 'Enemy Card',
  description: '',
  attackDamage: 2,
  health: 3,
  strength: 2,
}

describe('EnemyPhase', () => {
  let t: GameTestUtils
  let investigatorState: InvestigatorState
  let investigatorStateTwo: InvestigatorState

  beforeEach(() => {
    vi.clearAllMocks()

    mockGetEncounterCard(ENEMY_CARD)

    t = createGameTestUtils((context) => {
      context.investigatorStates.forEach((state, id) => {
        context.enemyStates.add(ENEMY_CARD, state.currentLocation, id)
      })

      investigatorState = context.investigatorStates.get(
        MOCK_INVESTIGATOR_ONE.id
      )!
      investigatorStateTwo = context.investigatorStates.get(
        MOCK_INVESTIGATOR_TWO.id
      )!

      return createEnemyPhase(context)
    })
  })

  it('enemy attacks investigator', () => {
    t.expectPhase('enemyAttack', 'enemy')
    t.executeAction({ type: 'confirm' })
    expect(investigatorState.damage).toBe(ENEMY_CARD.attackDamage)
  })

  it('enemy end enemy phase', () => {
    t.expectPhase('enemyAttack', 'enemy')
    t.executeAction({ type: 'confirm' })
    t.executeAction({ type: 'confirm' })
    t.expectPhase('upkeep')
  })

  it('enemy can defeat investigator', () => {
    const initialDamage = MOCK_INVESTIGATOR_ONE.health - 1
    investigatorState.addDamage(initialDamage)

    t.executeAction({ type: 'confirm' })
    expect(investigatorState.damage).toBe(
      initialDamage + ENEMY_CARD.attackDamage
    )
    expect(investigatorState.isDefeated()).toBe(true)
  })

  it('can defeat all investigators', () => {
    investigatorState.addDamage(MOCK_INVESTIGATOR_ONE.health - 1)
    investigatorStateTwo.addDamage(MOCK_INVESTIGATOR_TWO.health - 1)

    t.executeAction({ type: 'confirm' })
    t.executeAction({ type: 'confirm' })
    t.expectPhase('end', 'enemy')
  })
})

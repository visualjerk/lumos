import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  GameTestUtils,
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

  beforeEach(() => {
    vi.clearAllMocks()

    mockGetEncounterCard(ENEMY_CARD)

    t = createGameTestUtils((context) => {
      investigatorState = context.investigatorStates.get('1')!
      context.enemyStates.add(
        ENEMY_CARD,
        investigatorState.currentLocation,
        '1'
      )
      return createEnemyPhase(context)
    })
  })

  it('enemy attacks investigator', () => {
    t.expectPhase('enemyAttack', 'enemy')

    t.executeAction({ type: 'confirm' })
    expect(investigatorState.damage).toBe(2)

    t.expectPhase('upkeep')
  })
})

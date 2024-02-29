import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  GameTestUtils,
  createGameTestUtils,
  mockGetEncounterCard,
} from '../test'
import { InvestigatorState } from '../investigator'
import { EncounterState, createEncounterPhase } from '.'

const CARD_ID = 'ec-trap'

describe('EncounterPhase', () => {
  let t: GameTestUtils
  let investigatorState: InvestigatorState
  let encounterState: EncounterState

  beforeEach(() => {
    vi.clearAllMocks()

    mockGetEncounterCard({
      id: CARD_ID,
      type: 'trap',
      name: 'Trap Card',
      description: '',
      effect: {
        type: 'damage',
        target: 'self',
        amount: 1,
      },
    })

    t = createGameTestUtils(createEncounterPhase)
    investigatorState = t.game.context.investigatorStates.get('1')!
    encounterState = t.game.context.encounterState
  })

  it('can draw and confirm encounter card', () => {
    t.expectPhase('drawEncounter', 'encounter')
    expect(encounterState.deck).toHaveLength(
      t.game.context.scenario.encounterCards.length - 1
    )

    t.executeAction({ type: 'confirm' })
    expect(investigatorState.damage).toBe(1)
    expect(encounterState.discardPile).toEqual([CARD_ID])
  })

  it('can end encounter phase', () => {
    t.expectPhase('drawEncounter', 'encounter')
    t.executeAction({ type: 'confirm' })

    t.expectPhase('drawEncounter', 'encounter')
    t.executeAction({ type: 'confirm' })

    t.expectPhase('investigator')
  })

  it('can draw enemy card', () => {
    mockGetEncounterCard({
      id: CARD_ID,
      type: 'enemy',
      name: 'Enemy Card',
      description: '',
      health: 3,
      attackDamage: 2,
      strength: 2,
    })

    t = createGameTestUtils(createEncounterPhase)

    expect(encounterState.deck).toHaveLength(
      t.game.context.scenario.encounterCards.length - 1
    )

    t.executeAction({ type: 'confirm' })
    expect(t.game.context.getEnemyState(0)).toMatchObject({
      cardId: CARD_ID,
      engagedInvestigator: t.game.context.investigators[0].id,
    })
    expect(encounterState.discardPile).toEqual([])
  })
})

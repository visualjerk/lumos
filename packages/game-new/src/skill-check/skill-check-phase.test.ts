import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  GameTestUtils,
  createGameTestUtils,
  mockGetInvestigatorCard,
  mockSpinFateWheel,
} from '../test'
import { PhaseAction, Phase, PhaseBase } from '../phase'
import { Context } from '../context'
import { SkillCheck, createSkillCheckPhase } from '../skill-check'
import { spinFateWheel } from '../fate'
import { InvestigatorState } from '../investigator'

const skillCheck: SkillCheck = {
  skill: 'intelligence',
  investigatorId: '1',
  difficulty: 3,
  onSuccess: {
    type: 'collectClue',
    amount: 2,
    investigatorTarget: 'self',
    locationTarget: 'current',
  },
  onFailure: {
    type: 'collectClue',
    amount: 1,
    investigatorTarget: 'self',
    locationTarget: 'current',
  },
}

const TEST_PHASE_TYPE = 'test' as any

class TestPhase implements PhaseBase {
  type = TEST_PHASE_TYPE

  constructor(public context: Context) {}

  get actions() {
    const actions: PhaseAction[] = [
      {
        type: 'startSkillCheck',
        execute: (coordinator) =>
          coordinator.waitFor(createSkillCheckPhase(this.context, skillCheck)),
      },
    ]
    return actions
  }
}

function createTestPhase(context: Context): Phase {
  return new TestPhase(context) as Phase
}

describe('SkillCheckPhase', () => {
  let t: GameTestUtils
  let investigatorState: InvestigatorState
  let expectSuccess: () => void
  let expectFailure: () => void

  beforeEach(() => {
    vi.clearAllMocks()

    t = createGameTestUtils(createTestPhase)
    investigatorState = t.game.context.investigatorStates.get('1')!
    expectSuccess = () => {
      expect(investigatorState.clues).toBe(2)
    }
    expectFailure = () => {
      expect(investigatorState.clues).toBe(1)
    }

    t.expectPhase(TEST_PHASE_TYPE)

    mockSpinFateWheel({
      symbol: 1,
      modifySkillCheck: (n: number) => n,
    })
  })

  it('executes successful skill check', () => {
    t.executeAction({ type: 'startSkillCheck' })
    t.expectPhase('skillCheck', TEST_PHASE_TYPE)

    t.executeAction({ type: 'commitSkillCheck' })
    t.expectPhase('commitSkillCheck', TEST_PHASE_TYPE)

    t.executeAction({ type: 'endSkillCheck' })
    t.expectPhase(TEST_PHASE_TYPE)

    expectSuccess()
  })

  it('executes failed skill check', () => {
    vi.mocked(spinFateWheel).mockReturnValueOnce({
      symbol: 0,
      modifySkillCheck: () => 0,
    })

    t.executeAction({ type: 'startSkillCheck' })
    t.expectPhase('skillCheck', TEST_PHASE_TYPE)

    t.executeAction({ type: 'commitSkillCheck' })
    t.expectPhase('commitSkillCheck', TEST_PHASE_TYPE)

    t.executeAction({ type: 'endSkillCheck' })
    t.expectPhase(TEST_PHASE_TYPE)

    expectFailure()
  })

  const testCases: [modifier: number, result: 'fail' | 'success'][] = [
    [-1, 'fail'],
    [0, 'success'],
    [1, 'success'],
  ]

  it.each(testCases)(
    `skill check for modifier %s is a %s`,
    (modifier, result) => {
      mockSpinFateWheel({
        symbol: modifier,
        modifySkillCheck: (n: number) => n + modifier,
      })

      t.executeAction({ type: 'startSkillCheck' })
      t.executeAction({ type: 'commitSkillCheck' })
      t.executeAction({ type: 'endSkillCheck' })

      const expectFn = result === 'success' ? expectSuccess : expectFailure

      expectFn()
    }
  )

  it('can add card to skill check', () => {
    const cardId = 'ic-test-card'
    mockGetInvestigatorCard({
      id: cardId,
      type: 'skill',
      name: 'Test Card',
      description: '',
      skillModifier: { intelligence: 2 },
    })
    investigatorState.cardsInHand = [cardId]

    mockSpinFateWheel({
      symbol: -2,
      modifySkillCheck: (n: number) => n - 2,
    })

    t.executeAction({ type: 'startSkillCheck' })
    t.executeAction({ type: 'addToSkillCheck', cardIndex: 0 })
    t.executeAction({ type: 'commitSkillCheck' })
    t.executeAction({ type: 'endSkillCheck' })

    expectSuccess()
    expect(investigatorState.cardsInHand).toEqual([])
    expect(investigatorState.discardPile).toEqual([cardId])
  })

  it('cannot add card to skill check with empty hand', () => {
    investigatorState.cardsInHand = []
    t.executeAction({ type: 'startSkillCheck' })

    t.expectNoAction({ type: 'addToSkillCheck' })
  })
})

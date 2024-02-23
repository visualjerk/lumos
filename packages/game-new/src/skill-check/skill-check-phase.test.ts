import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GameTestUtils, createGameTestUtils } from '../test'
import { PhaseAction, Phase, PhaseBase } from '../phase'
import { Context } from '../context'
import { SkillCheck, createSkillCheckPhase } from '../skill-check'
import { spinFateWheel } from '../fate'
import { InvestigatorState } from '../investigator'

vi.mock('../fate', async () => ({
  ...(await vi.importActual('../fate')),
  spinFateWheel: vi.fn(() => ({
    symbol: 1,
    modifySkillCheck: (n: number) => n,
  })),
}))

const applySuccess = vi.fn()
const applyFailure = vi.fn()

const skillCheck: SkillCheck = {
  skill: 'intelligence',
  investigatorId: '1',
  difficulty: 3,
  onSuccess: {
    apply: applySuccess,
  },
  onFailure: {
    apply: applyFailure,
  },
}

class TestPhase implements PhaseBase {
  type = 'test'

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

  beforeEach(() => {
    t = createGameTestUtils(createTestPhase)
    investigatorState = t.game.context.investigatorStates.get('1')!
    t.expectPhase('test')
    vi.clearAllMocks()
  })

  it('executes successful skill check', () => {
    t.executeAction({ type: 'startSkillCheck' })
    t.expectPhase('skillCheck', 'test')

    t.executeAction({ type: 'commitSkillCheck' })
    t.expectPhase('commitSkillCheck', 'test')

    t.executeAction({ type: 'endSkillCheck' })
    t.expectPhase('test')

    expect(applySuccess).toHaveBeenCalledWith(t.game.context)
  })

  it('executes failed skill check', () => {
    vi.mocked(spinFateWheel).mockReturnValueOnce({
      symbol: 0,
      modifySkillCheck: () => 0,
    })

    t.executeAction({ type: 'startSkillCheck' })
    t.expectPhase('skillCheck', 'test')

    t.executeAction({ type: 'commitSkillCheck' })
    t.expectPhase('commitSkillCheck', 'test')

    t.executeAction({ type: 'endSkillCheck' })
    t.expectPhase('test')

    expect(applyFailure).toHaveBeenCalledWith(t.game.context)
  })

  const testCases: [modifier: number, result: 'fail' | 'success'][] = [
    [-1, 'fail'],
    [0, 'success'],
    [1, 'success'],
  ]

  it.each(testCases)(
    `skill check for modifier %s is a %s`,
    (modifier, result) => {
      vi.mocked(spinFateWheel).mockReturnValueOnce({
        symbol: modifier,
        modifySkillCheck: (n: number) => n + modifier,
      })

      t.executeAction({ type: 'startSkillCheck' })
      t.executeAction({ type: 'commitSkillCheck' })
      t.executeAction({ type: 'endSkillCheck' })

      const applyFn = result === 'success' ? applySuccess : applyFailure

      expect(applyFn).toHaveBeenCalledOnce()
    }
  )

  it('can add card to skill check', () => {
    // Force of Will has an intelligence modifier of 2
    const cardId = 'ic1'
    investigatorState.cardsInHand = [cardId]

    vi.mocked(spinFateWheel).mockReturnValueOnce({
      symbol: -2,
      modifySkillCheck: (n: number) => n - 2,
    })

    t.executeAction({ type: 'startSkillCheck' })
    t.executeAction({ type: 'addToSkillCheck', cardIndex: 0 })
    t.executeAction({ type: 'commitSkillCheck' })
    t.executeAction({ type: 'endSkillCheck' })

    expect(applySuccess).toHaveBeenCalledOnce()
    expect(investigatorState.cardsInHand).toEqual([])
    expect(investigatorState.discardPile).toEqual([cardId])
  })
})

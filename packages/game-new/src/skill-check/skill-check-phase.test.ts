import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GameTestUtils, createGameTestUtils } from '../test'
import { Action, Phase, PhaseBase } from '../phase'
import { Context } from '@lumos/game'
import { SkillCheck, createSkillCheckPhase } from '../skill-check'
import { spinFateWheel } from '../fate'

vi.mock('../fate', () => ({
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
    const actions: Action[] = [
      {
        type: 'startSkillCheck',
        execute: (e) =>
          e.waitFor(createSkillCheckPhase(this.context, skillCheck)),
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

  beforeEach(() => {
    t = createGameTestUtils(createTestPhase)
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
})

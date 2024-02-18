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
  difficulty: 3,
  onSuccess: {
    apply: applySuccess,
  },
  onFailure: {
    apply: applyFailure,
  },
}

const effectContext = {
  investigatorId: '1',
  locationId: '1',
}

class TestPhase implements PhaseBase {
  type = 'test'

  constructor(public context: Context) {}

  get actions() {
    const actions: Action[] = [
      {
        type: 'startSkillCheck',
        execute: (e) =>
          e.waitFor(
            createSkillCheckPhase(this.context, skillCheck, effectContext)
          ),
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

    expect(applySuccess).toHaveBeenCalledWith(
      t.game.context,
      expect.objectContaining(effectContext)
    )
  })

  it('executes failed skill check', () => {
    vi.mocked(spinFateWheel).mockReturnValue({
      symbol: 0,
      modifySkillCheck: () => 0,
    })

    t.executeAction({ type: 'startSkillCheck' })
    t.expectPhase('skillCheck', 'test')

    t.executeAction({ type: 'commitSkillCheck' })
    t.expectPhase('commitSkillCheck', 'test')

    t.executeAction({ type: 'endSkillCheck' })
    t.expectPhase('test')

    expect(applyFailure).toHaveBeenCalledWith(
      t.game.context,
      expect.objectContaining(effectContext)
    )
  })
})

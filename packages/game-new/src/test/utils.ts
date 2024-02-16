import { Context, createInitialContext } from '@lumos/game'
import { MOCK_INVESTIGATOR_ONE, MOCK_INVESTIGATOR_TWO, MOCK_SCENARIO } from '.'
import { Phase } from '../phase'
import { Game } from '../game'
import { expect } from 'vitest'

function createTestContext() {
  return createInitialContext(MOCK_SCENARIO, [
    MOCK_INVESTIGATOR_ONE,
    MOCK_INVESTIGATOR_TWO,
  ])
}

type ActionFilterParams = {
  type: string
}

function executeAction(
  game: Game,
  actionSearchParams: ActionFilterParams,
  index: number = 0
) {
  const actions = game.phase.actions.filter(
    (action) => action.type === actionSearchParams.type
  )
  actions[index].execute()
}

function createTestGameFromPhase(createPhase: (context: Context) => Phase) {
  const context = createTestContext()
  return new Game(context, createPhase(context))
}

export function createGameTestUtils(createPhase: (context: Context) => Phase) {
  const game = createTestGameFromPhase(createPhase)

  function expectPhase(type: string, parentType?: string) {
    parentType = parentType ?? type
    expect(game.phase.type).toBe(type)
    expect(game.parentPhase.type).toBe(parentType)
  }

  function expectOnlyActions(actionSearchParams: ActionFilterParams) {
    const otherActions = game.phase.actions.filter(
      (action) => action.type !== actionSearchParams.type
    )
    expect(otherActions.length).toBe(0)
  }

  return {
    game,
    executeAction: executeAction.bind(null, game),
    expectPhase,
    expectOnlyActions,
  }
}

export type GameTestUtils = ReturnType<typeof createGameTestUtils>

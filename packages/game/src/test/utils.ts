import { MOCK_INVESTIGATOR_ONE, MOCK_INVESTIGATOR_TWO, MOCK_SCENARIO } from '.'
import { Phase, PhaseActionFilterParams, actionMatches } from '../phase'
import { Game } from '../game'
import { expect } from 'vitest'
import { Context, createInitialContext } from '../context'

function createTestContext() {
  return createInitialContext(MOCK_SCENARIO, [
    MOCK_INVESTIGATOR_ONE,
    MOCK_INVESTIGATOR_TWO,
  ])
}

function executeAction(
  game: Game,
  actionSearchParams: PhaseActionFilterParams,
  index: number = 0
) {
  const actions = game.phase.actions.filter((action) =>
    actionMatches(action, actionSearchParams)
  )
  expect(actions[index]).toBeDefined()
  actions[index].execute()
}

function createTestGameFromPhase(createPhase: (context: Context) => Phase) {
  const context = createTestContext()
  return new Game(context, createPhase(context))
}

export function createGameTestUtils(createPhase: (context: Context) => Phase) {
  const game = createTestGameFromPhase(createPhase)

  function expectPhase(type: Phase['type'], parentType?: Phase['type']) {
    parentType = parentType ?? type
    expect(game.phase.type).toBe(type)
    expect(game.parentPhase.type).toBe(parentType)
  }

  function expectOnlyActions(actionSearchParams: PhaseActionFilterParams) {
    const otherActions = game.phase.actions.filter(
      (action) => !actionMatches(action, actionSearchParams)
    )
    expect(otherActions.length).toBe(0)
  }

  function expectNoAction(actionSearchParams: PhaseActionFilterParams) {
    const actions = game.phase.actions.filter((action) =>
      actionMatches(action, actionSearchParams)
    )
    expect(actions.length).toBe(0)
  }

  return {
    game,
    executeAction: executeAction.bind(null, game),
    expectPhase,
    expectOnlyActions,
    expectNoAction,
  }
}

export type GameTestUtils = ReturnType<typeof createGameTestUtils>

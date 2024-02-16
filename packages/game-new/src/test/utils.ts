import { Context, LocationId, createInitialContext } from '@lumos/game'
import { MOCK_INVESTIGATOR_ONE, MOCK_INVESTIGATOR_TWO, MOCK_SCENARIO } from '.'
import { Phase } from '../phase'
import { Game, GameAction } from '../game'
import { expect } from 'vitest'

function createTestContext() {
  return createInitialContext(MOCK_SCENARIO, [
    MOCK_INVESTIGATOR_ONE,
    MOCK_INVESTIGATOR_TWO,
  ])
}

type ActionFilterParams = {
  type: string
  locationId?: LocationId
}

function actionMatches(
  action: GameAction,
  { type, locationId }: ActionFilterParams
): boolean {
  if (action.type !== type) {
    return false
  }

  if (locationId !== undefined && action.locationId !== locationId) {
    return false
  }

  return true
}

function executeAction(
  game: Game,
  actionSearchParams: ActionFilterParams,
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

  function expectPhase(type: string, parentType?: string) {
    parentType = parentType ?? type
    expect(game.phase.type).toBe(type)
    expect(game.parentPhase.type).toBe(parentType)
  }

  function expectOnlyActions(actionSearchParams: ActionFilterParams) {
    const otherActions = game.phase.actions.filter(
      (action) => !actionMatches(action, actionSearchParams)
    )
    expect(otherActions.length).toBe(0)
  }

  function expectNoAction(actionSearchParams: ActionFilterParams) {
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

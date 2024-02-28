import {
  InvestigateAction,
  InvestigateActionPhase,
  createInvestigateActionPhase,
} from './investigate-action'
import {
  DrawAction,
  DrawActionPhase,
  createDrawActionPhase,
} from './draw-action'
import { Context } from '../context'
import { InvestigatorId } from '../investigator'
import {
  CollectClueAction,
  CollectClueActionPhase,
  createCollectClueActionPhase,
} from './collect-clue-action'

export type Action = InvestigateAction | DrawAction | CollectClueAction

export type ActionPhase =
  | InvestigateActionPhase
  | DrawActionPhase
  | CollectClueActionPhase

export type CreateAction<Type extends string> = {
  type: Type
}

export function createActionPhase(
  context: Context,
  investigatorId: InvestigatorId,
  action: Action
): ActionPhase {
  switch (action.type) {
    case 'investigate':
      return createInvestigateActionPhase(context, investigatorId, action)
    case 'draw':
      return createDrawActionPhase(context, investigatorId, action)
    case 'collectClue':
      return createCollectClueActionPhase(context, investigatorId, action)
  }
}

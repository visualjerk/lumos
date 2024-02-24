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

export type Action = InvestigateAction | DrawAction

export type ActionPhase = InvestigateActionPhase | DrawActionPhase

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
  }
}

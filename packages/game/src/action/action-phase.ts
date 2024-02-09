import { Action, DrawAction } from './action'
import { Context } from '../context'
import { CreatePhase, Phase } from '../phase'

export type ActionPhase = DrawActionPhase

export type ActionContext = {
  action: Action
  nextPhase: (context: Context) => Phase
}

export function createActionPhase(
  context: Context,
  actionContext: ActionContext
): Phase {
  if (actionContext.action.type === 'draw') {
    return createDrawActionPhase(context, {
      action: actionContext.action,
      nextPhase: actionContext.nextPhase,
    })
  }

  return actionContext.nextPhase(context)
}

export type DrawActionPhase = CreatePhase<'drawAction'>

export type DrawActionContext = {
  action: DrawAction
  nextPhase: (context: Context) => Phase
}

export function createDrawActionPhase(
  context: Context,
  actionContext: DrawActionContext
): Phase {
  if (actionContext.action.target === 'self') {
    const investigatorId = context.investigators[0].id
    const investigatorState = context.getInvestigatorState(investigatorId)
    investigatorState.draw(actionContext.action.amount)

    return actionContext.nextPhase(context)
  }

  return actionContext.nextPhase(context)
}

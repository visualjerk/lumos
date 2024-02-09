import { Action, DrawAction } from './action'
import { Context } from '../context'
import { CreatePhase, Phase } from '../phase'
import { InvestigatorId } from '..'
import { createTargetInvestigatorPhase } from '../target'

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
  const { action, nextPhase } = actionContext

  if (action.target === 'self') {
    executeDraw(context, {
      // TODO: Add current investigator
      investigatorId: context.investigators[0].id,
      action,
    })

    return nextPhase(context)
  }

  return createTargetInvestigatorPhase(context, {
    nextPhase: (context, target) => {
      executeDraw(context, {
        investigatorId: target.investigatorId,
        action,
      })

      return nextPhase(context)
    },
  })
}

export type ExecuteDrawContext = {
  investigatorId: InvestigatorId
  action: DrawAction
}

export function executeDraw(context: Context, drawContext: ExecuteDrawContext) {
  const investigatorState = context.getInvestigatorState(
    drawContext.investigatorId
  )
  investigatorState.draw(drawContext.action.amount)
}

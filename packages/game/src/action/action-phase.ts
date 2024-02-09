import { Action, DrawAction } from './action'
import { Context } from '../context'
import { CreatePhase, Phase, PhaseAction } from '../phase'
import { InvestigatorId } from '..'

export type ActionPhase = DrawActionPhase | ChooseInvestigatorPhase

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
    executeDraw(context, {
      // TODO: Add current investigator
      investigatorId: context.investigators[0].id,
      action: actionContext.action,
    })

    return actionContext.nextPhase(context)
  }

  if (actionContext.action.target === 'investigator') {
    return createChooseInvestigatorPhase(context, {
      action: actionContext.action,
      nextPhase: (context, target) => {
        executeDraw(context, {
          investigatorId: target.investigatorId,
          action: actionContext.action,
        })

        return actionContext.nextPhase(context)
      },
    })
  }

  return actionContext.nextPhase(context)
}

export type ChooseInvestigatorPhase = CreatePhase<'chooseInvestigator'>

export type ChooseInvestigatorTarget = {
  investigatorId: InvestigatorId
}

export type ChooseInvestigatorContext = {
  action: DrawAction
  nextPhase: (context: Context, target: ChooseInvestigatorTarget) => Phase
}

export function createChooseInvestigatorPhase(
  context: Context,
  chooseInvestigatorContext: ChooseInvestigatorContext
): ChooseInvestigatorPhase {
  const actions: PhaseAction[] = []

  for (const investigator of context.investigators) {
    actions.push({
      type: 'chooseInvestigator',
      investigatorId: investigator.id,
      execute: () =>
        chooseInvestigatorContext.nextPhase(context, {
          investigatorId: investigator.id,
        }),
    })
  }

  return {
    type: 'chooseInvestigator',
    actions,
    context,
  }
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

import { Context } from '@lumos/game'
import { PhaseBase, PhaseResult } from '../phase'
import {
  InvestigateAction,
  createInvestigateActionPhase,
} from './investigate-action'

export type Action = InvestigateAction

export type CreateAction<Type extends string> = {
  type: Type
}

export function createActionPhase(
  context: Context,
  action: Action
): PhaseBase<PhaseResult> {
  switch (action.type) {
    case 'investigate':
      return createInvestigateActionPhase(context, action)
  }
}

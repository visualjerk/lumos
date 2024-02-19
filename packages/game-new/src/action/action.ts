import { Context } from '@lumos/game'
import { PhaseResult } from '../phase'
import { SkillCheck, createSkillCheckPhase } from '../skill-check'
import { GameExecute } from '../game'
import {
  InvestigatorTargetScope,
  LocationTargetScope,
  executeTargetInvestigator,
  executeTargetLocation,
} from '../target'

export type Action = InvestigateAction

export type CreateAction<Type extends string> = {
  type: Type
}

export function executeAction(
  e: GameExecute<[], PhaseResult>,
  context: Context,
  action: Action
) {
  switch (action.type) {
    case 'investigate':
      return executeInvestigateAction(e, context, action)
  }
}

export type InvestigateAction = CreateAction<'investigate'> & {
  clueAmount: number
  locationTarget: LocationTargetScope
  investigatorTarget: InvestigatorTargetScope
}

export function executeInvestigateAction(
  e: GameExecute<[], PhaseResult>,
  context: Context,
  action: InvestigateAction
) {
  // TODO: add current investigator to context
  const investigatorId = context.investigators[0].id

  const investigatorExecute = executeTargetInvestigator(
    e,
    context,
    investigatorId,
    { type: 'investigator', scope: action.investigatorTarget }
  )
  return executeTargetLocation(investigatorExecute, context, investigatorId, {
    type: 'location',
    scope: action.locationTarget,
  }).waitFor(([{ investigatorId }, { locationId }]) => {
    const location = context.getLocation(locationId)

    const skillCheck: SkillCheck = {
      investigatorId,
      skill: 'intelligence',
      difficulty: location.shroud,
      onFailure: () => {},
      onSuccess: () => {
        for (let i = 0; i < action.clueAmount; i++) {
          context.collectClue(investigatorId, locationId)
        }
      },
    }

    return createSkillCheckPhase(context, skillCheck)
  })
}

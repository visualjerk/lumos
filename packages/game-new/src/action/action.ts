import { Context } from '@lumos/game'
import { PhaseResult } from '../phase'
import { SkillCheck, createSkillCheckPhase } from '../skill-check'
import { GameExecute } from '../game'
import {
  InvestigatorTargetScope,
  LocationTargetScope,
  executeTargetLocation,
} from '../target'

export type Action = InvestigateAction

export type CreateAction<Type extends string> = {
  type: Type
}

export function executeAction(
  e: GameExecute<[], PhaseResult, []>,
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
  e: GameExecute<[], PhaseResult, []>,
  context: Context,
  action: InvestigateAction
) {
  // TODO: Add target phase for this (self | investigator)
  const investigatorId = context.investigators[0].id

  return executeTargetLocation(e, context, investigatorId, {
    type: 'location',
    scope: action.locationTarget,
  }).waitFor(([{ locationId }]) => {
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

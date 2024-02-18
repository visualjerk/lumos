import { Context } from '@lumos/game'
import { PhaseResult } from '../phase'
import { SkillCheck, createSkillCheckPhase } from '../skill-check'
import { GameExecute } from '../game'

export type Action = InvestigateAction

export type CreateAction<Type extends string> = {
  type: Type
}

export type InvestigateAction = CreateAction<'investigate'> & {
  clueAmount: number
}

export function executeInvestigateAction(
  e: GameExecute<[], PhaseResult>,
  context: Context,
  action: Omit<InvestigateAction, 'type'>
) {
  // TODO: Add target phase for this (self | investigator)
  const investigatorId = context.investigators[0].id
  // TODO: Add target phase to select location (current | connected)
  const currentLocation = context.getInvestigatorLocation(investigatorId)

  const skillCheck: SkillCheck = {
    investigatorId,
    skill: 'intelligence',
    difficulty: currentLocation.shroud,
    onFailure: () => {},
    onSuccess: () => {
      for (let i = 0; i < action.clueAmount; i++) {
        context.collectClue(investigatorId, currentLocation.id)
      }
    },
  }
  return e.waitFor(createSkillCheckPhase(context, skillCheck))
}

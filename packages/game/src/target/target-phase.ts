import { Context } from '../context'
import { InvestigatorId } from '../investigator'
import { CreatePhase, Phase, PhaseAction } from '../phase'

export type TargetPhase = TargetInvestigatorPhase

export type TargetInvestigatorPhase = CreatePhase<'chooseInvestigator'>

export type InvestigatorTarget = {
  investigatorId: InvestigatorId
}

export type TargetInvestigatorContext = {
  nextPhase: (context: Context, target: InvestigatorTarget) => Phase
}

export function createTargetInvestigatorPhase(
  context: Context,
  targetInvestigatorContext: TargetInvestigatorContext
): TargetInvestigatorPhase {
  const actions: PhaseAction[] = []
  const { nextPhase } = targetInvestigatorContext

  for (const investigator of context.investigators) {
    actions.push({
      type: 'chooseInvestigator',
      investigatorId: investigator.id,
      execute: () =>
        nextPhase(context, {
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

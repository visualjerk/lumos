import { Context, InvestigatorId } from '@lumos/game'
import { GameExecute } from '../game'
import { PhaseBase } from '../phase'

export type InvestigatorTargetScope = 'self'

export type InvestigatorTarget = {
  type: 'investigator'
  scope: InvestigatorTargetScope
}

export type InvestigatorTargetResult = {
  investigatorId: InvestigatorId
}

export function executeTargetInvestigator<TGameExecute extends GameExecute>(
  e: TGameExecute,
  context: Context,
  investigatorId: InvestigatorId,
  investigatorTarget: InvestigatorTarget
) {
  // Instantly resolve if scope is self
  if (investigatorTarget.scope === 'self') {
    return e.addResult({
      investigatorId,
    })
  }
  return e.waitFor(
    new InvestigatorTargetPhase(context, investigatorId, investigatorTarget)
  )
}

export class InvestigatorTargetPhase
  implements PhaseBase<InvestigatorTargetResult>
{
  type = 'investigatorTarget'

  constructor(
    public context: Context,
    public investigatorId: InvestigatorId,
    public investigatorTarget: InvestigatorTarget
  ) {}

  get actions() {
    return []
  }
}

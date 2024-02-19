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

export function createInvestigatorTargetPhase(
  context: Context,
  investigatorId: InvestigatorId,
  investigatorTarget: InvestigatorTarget
): InvestigatorTargetPhase {
  return new InvestigatorTargetPhase(
    context,
    investigatorId,
    investigatorTarget
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

  onEnter(gameExecute: GameExecute<[], InvestigatorTargetResult>) {
    // Instantly resolve if scope is self
    if (this.investigatorTarget.scope === 'self') {
      gameExecute.applyToParent(() => ({
        investigatorId: this.investigatorId,
      }))
    }
  }

  get actions() {
    return []
  }
}

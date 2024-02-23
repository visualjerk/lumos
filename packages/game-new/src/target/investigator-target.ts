import { Context } from '../context'
import { GamePhaseCoordinator } from '../game'
import { InvestigatorId } from '../investigator'
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

  onEnter(coordinator: GamePhaseCoordinator<[], InvestigatorTargetResult>) {
    // Instantly resolve if scope is self
    if (this.investigatorTarget.scope === 'self') {
      coordinator.applyToParent(() => ({
        investigatorId: this.investigatorId,
      }))
    }
  }

  get actions() {
    return []
  }
}

import { Context } from '../context'
import { GamePhaseCoordinator } from '../game'
import { InvestigatorId } from '../investigator'
import { PhaseAction, PhaseBase } from '../phase'

export type InvestigatorTargetScope = 'self' | 'any'

export type InvestigatorTarget =
  | InvestigatorTargetScope
  | InvestigatorTargetResult

export type InvestigatorTargetResult = {
  investigatorId: InvestigatorId
}

function isInvestigatorTargetResult(
  target: InvestigatorTarget
): target is InvestigatorTargetResult {
  return typeof target === 'object' && 'investigatorId' in target
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
  type = 'investigatorTarget' as const

  constructor(
    public context: Context,
    public investigatorId: InvestigatorId,
    public investigatorTarget: InvestigatorTarget
  ) {}

  onEnter(coordinator: GamePhaseCoordinator<[], InvestigatorTargetResult>) {
    const target = this.investigatorTarget

    // Instantly resolve if target is already a result
    if (isInvestigatorTargetResult(target)) {
      coordinator.applyToParent(() => target)
      return
    }

    // Instantly resolve if scope is self
    if (target === 'self') {
      coordinator.applyToParent(() => ({
        investigatorId: this.investigatorId,
      }))
    }
  }

  get actions() {
    const actions: PhaseAction<InvestigatorTargetResult>[] = []

    if (this.investigatorTarget === 'any') {
      this.context.investigators.forEach((investigator) => {
        actions.push({
          type: 'select',
          investigatorId: investigator.id,
          execute: (coordinator) => {
            coordinator.applyToParent(() => ({
              investigatorId: investigator.id,
            }))
          },
        })
      })
    }

    return actions
  }
}

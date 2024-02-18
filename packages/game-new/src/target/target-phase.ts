import { Context } from '@lumos/game'
import { PhaseAction, PhaseBase } from '../phase'

export type TargetPhaseResult = {
  investigatorId: string
}

export class TargetPhase implements PhaseBase<TargetPhaseResult> {
  type = 'target'

  constructor(private context: Context) {}

  get actions() {
    return [...this.context.investigatorStates.keys()].map<
      PhaseAction<TargetPhaseResult>
    >((investigatorId) => ({
      type: 'target',
      execute: (e) =>
        e.applyToParent(() => ({
          investigatorId,
        })),
    }))
  }
}

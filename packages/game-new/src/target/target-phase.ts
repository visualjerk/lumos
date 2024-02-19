import { Context } from '@lumos/game'
import { PhaseAction, PhaseBase } from '../phase'
import { LocationTargetPhase } from './location-target'

export type TargetPhase = LocationTargetPhase | TargetPhase_TEST_REMOVE_ME

export type TargetPhaseResult_TEST_REMOVE_ME = {
  investigatorId: string
}

export class TargetPhase_TEST_REMOVE_ME
  implements PhaseBase<TargetPhaseResult_TEST_REMOVE_ME>
{
  type = 'target'

  constructor(private context: Context) {}

  get actions() {
    return [...this.context.investigatorStates.keys()].map<
      PhaseAction<TargetPhaseResult_TEST_REMOVE_ME>
    >((investigatorId) => ({
      type: 'target',
      execute: (e) =>
        e.applyToParent(() => ({
          investigatorId,
        })),
    }))
  }
}

import { Context, InvestigatorId } from '@lumos/game'
import { PhaseAction, PhaseBase } from '../phase'
import { LocationTarget, LocationTargetResult } from './target'

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

// export class LocationTargetPhase implements PhaseBase<LocationTargetResult> {
//   type = 'locationTarget'

//   constructor(
//     private context: Context,
//     private investigatorId: InvestigatorId,
//     private locationTarget: LocationTarget
//   ) {
//     if (locationTarget.scope === 'current') {
//       const currentLocation = this.context.getInvestigatorLocation(
//         this.investigatorId
//       )
//       this.game.applyToParent(() => ({
//         locationId: currentLocation.id,
//       }))
//     }
//   }

//   get actions() {
//     const actions: PhaseAction<LocationTargetResult>[] = []

//     return actions
//   }
// }

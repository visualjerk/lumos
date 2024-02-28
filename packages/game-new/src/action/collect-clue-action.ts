import {
  InvestigatorTarget,
  LocationTarget,
  createInvestigatorTargetPhase,
  createLocactionTargetPhase,
} from '../target'
import { CreateAction } from './action'
import { GamePhaseCoordinator } from '../game'
import { PhaseBase, PhaseResult } from '../phase'
import { Context } from '../context'
import { InvestigatorId } from '../investigator'

export type CollectClueAction = CreateAction<'collectClue'> & {
  amount: number
  locationTarget: LocationTarget
  investigatorTarget: InvestigatorTarget
}

export function createCollectClueActionPhase(
  context: Context,
  investigatorId: InvestigatorId,
  action: CollectClueAction
): CollectClueActionPhase {
  return new CollectClueActionPhase(context, investigatorId, action)
}

export class CollectClueActionPhase implements PhaseBase {
  type = 'collectClue'
  actions = []

  constructor(
    public context: Context,
    public investigatorId: InvestigatorId,
    public action: CollectClueAction
  ) {}

  onEnter(coordinator: GamePhaseCoordinator<[], PhaseResult>) {
    coordinator
      .waitFor(
        createInvestigatorTargetPhase(
          this.context,
          this.investigatorId,
          this.action.investigatorTarget
        )
      )
      .waitFor(
        createLocactionTargetPhase(
          this.context,
          this.investigatorId,
          this.action.locationTarget
        )
      )
      .apply(([{ investigatorId }, { locationId }]) => {
        for (let i = 0; i < this.action.amount; i++) {
          this.context.collectClue(investigatorId, locationId)
        }
      })
      .toParent()
  }
}

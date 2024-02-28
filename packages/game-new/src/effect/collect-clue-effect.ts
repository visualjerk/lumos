import {
  InvestigatorTarget,
  LocationTarget,
  createInvestigatorTargetPhase,
  createLocactionTargetPhase,
} from '../target'
import { CreateEffect } from './effect'
import { GamePhaseCoordinator } from '../game'
import { PhaseBase, PhaseResult } from '../phase'
import { Context } from '../context'
import { InvestigatorId } from '../investigator'

export type CollectClueEffect = CreateEffect<'collectClue'> & {
  amount: number
  locationTarget: LocationTarget
  investigatorTarget: InvestigatorTarget
}

export function createCollectClueEffectPhase(
  context: Context,
  investigatorId: InvestigatorId,
  effect: CollectClueEffect
): CollectClueEffectPhase {
  return new CollectClueEffectPhase(context, investigatorId, effect)
}

export class CollectClueEffectPhase implements PhaseBase {
  type = 'collectClue'
  actions = []

  constructor(
    public context: Context,
    public investigatorId: InvestigatorId,
    public effect: CollectClueEffect
  ) {}

  onEnter(coordinator: GamePhaseCoordinator<[], PhaseResult>) {
    coordinator
      .waitFor(
        createInvestigatorTargetPhase(
          this.context,
          this.investigatorId,
          this.effect.investigatorTarget
        )
      )
      .waitFor(
        createLocactionTargetPhase(
          this.context,
          this.investigatorId,
          this.effect.locationTarget
        )
      )
      .apply(([{ investigatorId }, { locationId }]) => {
        for (let i = 0; i < this.effect.amount; i++) {
          this.context.collectClue(investigatorId, locationId)
        }
      })
      .toParent()
  }
}

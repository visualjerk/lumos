import { PhaseBase, PhaseResult } from '../phase'
import { SkillCheck, createSkillCheckPhase } from '../skill-check'
import { GamePhaseCoordinator } from '../game'
import {
  InvestigatorTarget,
  LocationTarget,
  createInvestigatorTargetPhase,
  createLocactionTargetPhase,
} from '../target'
import { CreateEffect } from './effect'
import { Context } from '../context'
import { InvestigatorId } from '../investigator'

export type InvestigateEffect = CreateEffect<'investigate'> & {
  clueAmount: number
  locationTarget: LocationTarget
  investigatorTarget: InvestigatorTarget
}

export function createInvestigateEffectPhase(
  context: Context,
  investigatorId: InvestigatorId,
  effect: InvestigateEffect
): InvestigateEffectPhase {
  return new InvestigateEffectPhase(context, investigatorId, effect)
}

export class InvestigateEffectPhase implements PhaseBase {
  type = 'investigateEffect' as const
  actions = []

  constructor(
    public context: Context,
    public investigatorId: InvestigatorId,
    public effect: InvestigateEffect
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
      .waitFor(([{ investigatorId }, { locationId }]) => {
        const location = this.context.getLocation(locationId)

        const skillCheck: SkillCheck = {
          investigatorId,
          skill: 'intelligence',
          difficulty: location.shroud,
          onSuccess: {
            type: 'collectClue',
            amount: this.effect.clueAmount,
            locationTarget: { locationId },
            investigatorTarget: { investigatorId },
          },
        }

        return createSkillCheckPhase(this.context, skillCheck)
      })
      .toParent()
  }
}

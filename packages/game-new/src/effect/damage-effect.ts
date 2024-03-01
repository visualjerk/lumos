import { InvestigatorTarget, createInvestigatorTargetPhase } from '../target'
import { CreateEffect } from './effect'
import { GamePhaseCoordinator } from '../game'
import { PhaseBase, PhaseResult } from '../phase'
import { Context } from '../context'
import { InvestigatorId } from '../investigator'
import { createEndPhase } from '../end'

export type DamageEffect = CreateEffect<'damage'> & {
  amount: number
  target: InvestigatorTarget
}

export function createDamageEffectPhase(
  context: Context,
  investigatorId: InvestigatorId,
  effect: DamageEffect
): DamageEffectPhase {
  return new DamageEffectPhase(context, investigatorId, effect)
}

export class DamageEffectPhase implements PhaseBase {
  type = 'damageEffect' as const
  actions = []

  constructor(
    public context: Context,
    public investigatorId: InvestigatorId,
    public effect: DamageEffect
  ) {}

  onEnter(coordinator: GamePhaseCoordinator<[], PhaseResult>) {
    coordinator
      .waitFor(
        createInvestigatorTargetPhase(
          this.context,
          this.investigatorId,
          this.effect.target
        )
      )
      .apply(([{ investigatorId }]) => {
        const investigatorState =
          this.context.getInvestigatorState(investigatorId)
        investigatorState.addDamage(this.effect.amount)

        if (this.context.investigatorStates.allDefeated) {
          coordinator.toNext(createEndPhase(this.context))
          return
        }

        coordinator.toParent()
      })
  }
}

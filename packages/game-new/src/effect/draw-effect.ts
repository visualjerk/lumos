import { InvestigatorTarget, createInvestigatorTargetPhase } from '../target'
import { CreateEffect } from './effect'
import { GamePhaseCoordinator } from '../game'
import { PhaseBase, PhaseResult } from '../phase'
import { Context } from '../context'
import { InvestigatorId } from '../investigator'

export type DrawEffect = CreateEffect<'draw'> & {
  amount: number
  target: InvestigatorTarget
}

export function createDrawEffectPhase(
  context: Context,
  investigatorId: InvestigatorId,
  effect: DrawEffect
): DrawEffectPhase {
  return new DrawEffectPhase(context, investigatorId, effect)
}

export class DrawEffectPhase implements PhaseBase {
  type = 'draw'
  actions = []

  constructor(
    public context: Context,
    public investigatorId: InvestigatorId,
    public effect: DrawEffect
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
        for (let i = 0; i < this.effect.amount; i++) {
          if (investigatorState.canDraw()) {
            investigatorState.draw()
          }
        }
      })
      .toParent()
  }
}

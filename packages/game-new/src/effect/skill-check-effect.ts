import { InvestigatorTarget, createInvestigatorTargetPhase } from '../target'
import { CreateEffect } from './effect'
import { GamePhaseCoordinator } from '../game'
import { PhaseBase, PhaseResult } from '../phase'
import { Context } from '../context'
import { InvestigatorId } from '../investigator'
import { SkillCheck, createSkillCheckPhase } from '../skill-check'

export type SkillCheckEffect = CreateEffect<'skillCheck'> &
  Omit<SkillCheck, 'investigatorId'> & {
    target: InvestigatorTarget
  }

export function createSkillCheckEffectPhase(
  context: Context,
  investigatorId: InvestigatorId,
  effect: SkillCheckEffect
): SkillCheckEffectPhase {
  return new SkillCheckEffectPhase(context, investigatorId, effect)
}

export class SkillCheckEffectPhase implements PhaseBase {
  type = 'skillCheck'
  actions = []

  constructor(
    public context: Context,
    public investigatorId: InvestigatorId,
    public effect: SkillCheckEffect
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
      .waitFor(([{ investigatorId }]) =>
        createSkillCheckPhase(this.context, {
          investigatorId,
          ...this.effect,
        })
      )
      .toParent()
  }
}

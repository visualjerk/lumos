import { InvestigatorTarget, createInvestigatorTargetPhase } from '../target'
import { CreateEffect, createEffectPhase } from './effect'
import { GamePhaseCoordinator } from '../game'
import { PhaseBase, PhaseResult } from '../phase'
import { Context } from '../context'
import { InvestigatorId } from '../investigator'

export type EnemyOpportunityAttackEffect =
  CreateEffect<'enemyOpportunityAttack'> & {
    target: InvestigatorTarget
  }

export function createEnemyOpportunityAttackEffectPhase(
  context: Context,
  investigatorId: InvestigatorId,
  effect: EnemyOpportunityAttackEffect
): EnemyOpportunityAttackEffectPhase {
  return new EnemyOpportunityAttackEffectPhase(context, investigatorId, effect)
}

export class EnemyOpportunityAttackEffectPhase implements PhaseBase {
  type = 'enemyOpportunityAttack'
  actions = []

  constructor(
    public context: Context,
    public investigatorId: InvestigatorId,
    public effect: EnemyOpportunityAttackEffect
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
      .waitForAll(([{ investigatorId }]) => {
        const engagedEnemyIndexes =
          this.context.getEngagedEnemies(investigatorId)

        return engagedEnemyIndexes.map((enemyIndex) =>
          createEffectPhase(this.context, investigatorId, {
            type: 'enemyAttack',
            enemyTarget: { enemyIndex },
            investigatorTarget: { investigatorId },
          })
        )
      })
      .toParent()
  }
}

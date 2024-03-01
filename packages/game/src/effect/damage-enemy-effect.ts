import { EnemyTarget, createEnemyTargetPhase } from '../target'
import { CreateEffect } from './effect'
import { GamePhaseCoordinator } from '../game'
import { PhaseBase, PhaseResult } from '../phase'
import { Context } from '../context'
import { InvestigatorId } from '../investigator'

export type DamageEnemyEffect = CreateEffect<'damageEnemy'> & {
  amount: number
  target: EnemyTarget
}

export function createDamageEnemyEffectPhase(
  context: Context,
  investigatorId: InvestigatorId,
  effect: DamageEnemyEffect
): DamageEnemyEffectPhase {
  return new DamageEnemyEffectPhase(context, investigatorId, effect)
}

export class DamageEnemyEffectPhase implements PhaseBase {
  type = 'damageEnemyEffect' as const
  actions = []

  constructor(
    public context: Context,
    public investigatorId: InvestigatorId,
    public effect: DamageEnemyEffect
  ) {}

  onEnter(coordinator: GamePhaseCoordinator<[], PhaseResult>) {
    coordinator
      .waitFor(
        createEnemyTargetPhase(
          this.context,
          this.investigatorId,
          this.effect.target
        )
      )
      .apply(([{ enemyIndex }]) => {
        const enemyState = this.context.getEnemyState(enemyIndex)
        enemyState.addDamage(this.effect.amount)

        if (enemyState.isDefeated()) {
          this.context.encounterState.discard(enemyState.cardId)
          this.context.enemyStates.remove(enemyState)
        }
      })
      .toParent()
  }
}

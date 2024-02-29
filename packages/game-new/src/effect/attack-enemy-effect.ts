import { PhaseBase, PhaseResult } from '../phase'
import { SkillCheck, createSkillCheckPhase } from '../skill-check'
import { GamePhaseCoordinator } from '../game'
import { EnemyTarget, createEnemyTargetPhase } from '../target'
import { CreateEffect } from './effect'
import { Context } from '../context'
import { InvestigatorId } from '../investigator'

export type AttackEnemyEffect = CreateEffect<'attackEnemy'> & {
  target: EnemyTarget
}

export function createAttackEnemyEffectPhase(
  context: Context,
  investigatorId: InvestigatorId,
  effect: AttackEnemyEffect
): AttackEnemyEffectPhase {
  return new AttackEnemyEffectPhase(context, investigatorId, effect)
}

export class AttackEnemyEffectPhase implements PhaseBase {
  type = 'attackEnemy'
  actions = []

  constructor(
    public context: Context,
    public investigatorId: InvestigatorId,
    public effect: AttackEnemyEffect
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
      .waitFor(([{ enemyIndex }]) => {
        const investigatorId = this.investigatorId
        const enemyState = this.context.getEnemyState(enemyIndex)

        const skillCheck: SkillCheck = {
          investigatorId,
          skill: 'strength',
          difficulty: enemyState.strength,
          onSuccess: {
            type: 'damageEnemy',
            amount: 1,
            target: { enemyIndex },
          },
        }

        return createSkillCheckPhase(this.context, skillCheck)
      })
      .toParent()
  }
}

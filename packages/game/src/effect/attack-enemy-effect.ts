import { PhaseBase, PhaseResult } from '../phase'
import { SkillCheck, createSkillCheckPhase } from '../skill-check'
import { GamePhaseCoordinator } from '../game'
import { EnemyTarget, createEnemyTargetPhase } from '../target'
import { CreateEffect } from './effect'
import { Context } from '../context'
import { InvestigatorId, Skill } from '../investigator'

export type AttackEnemyEffect = CreateEffect<'attackEnemy'> & {
  target: EnemyTarget
  skill: Skill
  amount: number
}

export function createAttackEnemyEffectPhase(
  context: Context,
  investigatorId: InvestigatorId,
  effect: AttackEnemyEffect
): AttackEnemyEffectPhase {
  return new AttackEnemyEffectPhase(context, investigatorId, effect)
}

export class AttackEnemyEffectPhase implements PhaseBase {
  type = 'attackEnemyEffect' as const
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
          skill: this.effect.skill,
          difficulty: enemyState.strength,
          onSuccess: {
            type: 'damageEnemy',
            amount: this.effect.amount,
            target: { enemyIndex },
          },
        }

        return createSkillCheckPhase(this.context, skillCheck)
      })
      .toParent()
  }
}

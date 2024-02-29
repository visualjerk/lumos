import {
  EnemyTarget,
  InvestigatorTarget,
  createEnemyTargetPhase,
  createInvestigatorTargetPhase,
} from '../target'
import { CreateEffect } from './effect'
import { GamePhaseCoordinator } from '../game'
import { PhaseAction, PhaseBase, PhaseResult } from '../phase'
import { Context } from '../context'
import { InvestigatorId } from '../investigator'
import { getEncounterCard } from '../encounter'
import { EnemyCard } from '../enemy'

export type EnemyAttackEffect = CreateEffect<'enemyAttack'> & {
  enemyTarget: EnemyTarget
  investigatorTarget: InvestigatorTarget
}

export function createEnemyAttackEffectPhase(
  context: Context,
  investigatorId: InvestigatorId,
  effect: EnemyAttackEffect
): EnemyAttackEffectPhase {
  return new EnemyAttackEffectPhase(context, investigatorId, effect)
}

export class EnemyAttackEffectPhase implements PhaseBase {
  type = 'enemyAttack'

  public enemyCard: EnemyCard | null = null
  public targetInvestigatorId: InvestigatorId | null = null

  constructor(
    public context: Context,
    public investigatorId: InvestigatorId,
    public effect: EnemyAttackEffect
  ) {}

  onEnter(coordinator: GamePhaseCoordinator<[], PhaseResult>) {
    coordinator
      .waitFor(
        createEnemyTargetPhase(
          this.context,
          this.investigatorId,
          this.effect.enemyTarget
        )
      )
      .waitFor(
        createInvestigatorTargetPhase(
          this.context,
          this.investigatorId,
          this.effect.investigatorTarget
        )
      )
      .apply(([{ enemyIndex }, { investigatorId }]) => {
        const enemy = this.context.getEnemyState(enemyIndex)

        // TODO: ensure this is an EnemyCard
        this.enemyCard = getEncounterCard(enemy.cardId) as EnemyCard
        this.targetInvestigatorId = investigatorId
      })
  }

  get actions() {
    const actions: PhaseAction[] = []

    const investigatorId = this.investigatorId
    const targetInvestigatorId = this.targetInvestigatorId!
    const enemyCard = this.enemyCard!

    actions.push({
      type: 'confirm',
      investigatorId,
      execute: (coordinator) =>
        coordinator
          .apply(() => {
            const investigatorState =
              this.context.getInvestigatorState(targetInvestigatorId)
            investigatorState.addDamage(enemyCard.attackDamage)
          })
          .toParent(),
    })

    return actions
  }
}

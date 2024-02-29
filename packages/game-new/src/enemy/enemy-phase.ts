import { Context } from '../context'
import { createEffectPhase } from '../effect'
import { GamePhaseCoordinator } from '../game'
import { PhaseBase } from '../phase'
import { createUpkeepPhase } from '../upkeep'

export function createEnemyPhase(context: Context) {
  return new EnemyPhase(context)
}

export class EnemyPhase implements PhaseBase {
  type = 'enemy'
  actions = []

  constructor(public context: Context) {}

  onEnter(coordinator: GamePhaseCoordinator) {
    this.context.enemyStates.forEach(({ engagedInvestigator }, enemyIndex) => {
      if (!engagedInvestigator) {
        return
      }
      coordinator = coordinator.waitFor(
        createEffectPhase(this.context, engagedInvestigator, {
          type: 'enemyAttack',
          investigatorTarget: 'self',
          enemyTarget: { enemyIndex },
        })
      )
    })
    coordinator.toNext(createUpkeepPhase(this.context))
  }
}

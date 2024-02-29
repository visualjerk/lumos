import { Context } from '../context'
import { GamePhaseCoordinator } from '../game'
import { InvestigatorId } from '../investigator'
import { PhaseBase } from '../phase'

export type EnemyTarget = EnemyTargetResult

export type EnemyTargetResult = {
  enemyIndex: number
}

function isEnemyTargetResult(target: EnemyTarget): target is EnemyTargetResult {
  return typeof target === 'object' && 'enemyIndex' in target
}

export function createEnemyTargetPhase(
  context: Context,
  investigatorId: InvestigatorId,
  enemyTarget: EnemyTarget
): EnemyTargetPhase {
  return new EnemyTargetPhase(context, investigatorId, enemyTarget)
}

export class EnemyTargetPhase implements PhaseBase<EnemyTargetResult> {
  type = 'investigatorTarget'

  constructor(
    public context: Context,
    public investigatorId: InvestigatorId,
    public enemyTarget: EnemyTarget
  ) {}

  onEnter(coordinator: GamePhaseCoordinator<[], EnemyTargetResult>) {
    const target = this.enemyTarget

    // Instantly resolve if target is already a result
    if (isEnemyTargetResult(target)) {
      coordinator.applyToParent(() => target)
      return
    }
  }

  get actions() {
    return []
  }
}

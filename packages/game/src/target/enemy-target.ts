import { Context } from '../context'
import { GamePhaseCoordinator } from '../game'
import { InvestigatorId } from '../investigator'
import { PhaseAction, PhaseBase } from '../phase'

export type EnemyTarget = EnemyTargetResult | 'any' | 'currentLocation'

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
  type = 'enemyTarget' as const

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
    const actions: PhaseAction<EnemyTargetResult>[] = []

    if (this.enemyTarget === 'currentLocation') {
      const currentLocation = this.context.getInvestigatorLocation(
        this.investigatorId
      )
      const enemyIndexes = this.context.getLocationEnemies(currentLocation.id)

      enemyIndexes.forEach((enemyIndex) => {
        actions.push({
          type: 'choose',
          enemyIndex,
          execute(coordinator) {
            coordinator.applyToParent(() => ({ enemyIndex }))
          },
        })
      })
    }

    if (this.enemyTarget === 'any') {
      const enemyIndexes = this.context.getEnemyIndexes()

      enemyIndexes.forEach((enemyIndex) => {
        actions.push({
          type: 'choose',
          enemyIndex,
          execute(coordinator) {
            coordinator.applyToParent(() => ({ enemyIndex }))
          },
        })
      })
    }

    return actions
  }
}

export function hasAnyEnemyTargets(
  context: Context,
  investigatorId: InvestigatorId,
  target: EnemyTarget
) {
  if (isEnemyTargetResult(target)) {
    return true
  }

  if (target === 'currentLocation') {
    const location = context.getInvestigatorLocation(investigatorId)
    return context.getLocationEnemies(location.id).length > 0
  }

  if (target === 'any') {
    return context.getEnemyIndexes().length > 0
  }
}

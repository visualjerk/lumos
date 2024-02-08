import { CreatePhase, Phase, PhaseAction } from '../phase'
import { Context } from '../context'
import { InvestigatorId } from '../investigator'

export type EnemyPhase = CreatePhase<'enemy'>

export function createEnemyPhase(context: Context): EnemyPhase {
  const actions: PhaseAction[] = []

  return {
    type: 'enemy',
    context,
    actions,
  }
}

export type EnemyAttackContext = {
  investigatorId: InvestigatorId
  nextPhase: (context: Context) => Phase
}

export type EnemyAttackPhase = CreatePhase<'enemyAttack'> & {
  enemyAttackContext: EnemyAttackContext
}

export function createEnemyAttackPhase(
  context: Context,
  enemyAttackContext: EnemyAttackContext
): Phase {
  function getNextEnemy() {
    return context.getReadyEngangedEnemy(enemyAttackContext.investigatorId)
  }

  const engagedEnemy = getNextEnemy()

  if (!engagedEnemy) {
    return enemyAttackContext.nextPhase(context)
  }

  const actions: PhaseAction[] = []

  actions.push({
    type: 'endEnemyAttack',
    execute: () => {
      engagedEnemy.attackEnganged(context)

      if (getNextEnemy()) {
        enemyAttackContext.nextPhase = (context) => {
          return createEnemyAttackPhase(context, enemyAttackContext)
        }
      }

      context
        .getEngagedEnemies(enemyAttackContext.investigatorId)
        .forEach((enemy) => {
          enemy.ready = true
        })

      return enemyAttackContext.nextPhase(context)
    },
  })

  return {
    type: 'enemyAttack',
    context,
    enemyAttackContext,
    actions,
  }
}

import { CreatePhase, Phase, PhaseAction } from '../phase'
import { Context } from '../context'
import { InvestigatorId, createCleanupPhase } from '../investigator'

export type EnemyPhase = CreatePhase<'enemy'>

export function createEnemyPhase(context: Context): EnemyPhase {
  const actions: PhaseAction[] = []

  actions.push({
    type: 'endEnemyPhase',
    execute: () => {
      // TODO: add current investigator
      const investigatorId = context.investigators[0].id

      return createEnemyAttackPhase(context, {
        investigatorId,
        nextPhase: (context) => createCleanupPhase(context),
      })
    },
  })

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
    context
      .getEngagedEnemies(enemyAttackContext.investigatorId)
      .forEach((enemy) => {
        enemy.ready = true
      })
    return enemyAttackContext.nextPhase(context)
  }

  const actions: PhaseAction[] = []

  actions.push({
    type: 'endEnemyAttack',
    execute: () => {
      engagedEnemy.attackEnganged(context)

      return createEnemyAttackPhase(context, enemyAttackContext)
    },
  })

  return {
    type: 'enemyAttack',
    context,
    enemyAttackContext,
    actions,
  }
}

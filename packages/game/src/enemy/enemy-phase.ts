import { CreatePhase, PhaseAction } from '../phase'
import { Context } from '../context'

export type EnemyPhase = CreatePhase<'enemy'>

export function createEnemyPhase(context: Context): EnemyPhase {
  const actions: PhaseAction[] = []

  return {
    type: 'enemy',
    context,
    actions,
  }
}

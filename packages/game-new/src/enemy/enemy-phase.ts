import { Context } from '../context'
import { PhaseBase } from '../phase'

export function createEnemyPhase(context: Context) {
  return new EnemyPhase(context)
}

export class EnemyPhase implements PhaseBase {
  type = 'enemy'
  actions = []

  constructor(public context: Context) {}
}

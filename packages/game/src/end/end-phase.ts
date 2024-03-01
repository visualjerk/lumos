import { Context } from '../context'
import { PhaseBase } from '../phase'

export function createEndPhase(context: Context) {
  return new EndPhase(context)
}

export class EndPhase implements PhaseBase {
  type = 'end' as const

  constructor(public context: Context) {}

  get actions() {
    return []
  }
}

import { createEffectPhase } from '../effect'
import { Context } from '../context'
import { createDoomPhase } from '../doom'
import { GamePhaseCoordinator } from '../game'
import { PhaseAction, PhaseBase } from '../phase'

export function createUpkeepPhase(context: Context) {
  return new UpkeepPhase(context)
}

export class UpkeepPhase implements PhaseBase {
  type = 'upkeep' as const

  constructor(public context: Context) {}

  onEnter(coordinator: GamePhaseCoordinator) {
    this.context.investigators.forEach(({ id }) => {
      coordinator = coordinator.waitFor(
        createEffectPhase(this.context, id, {
          type: 'draw',
          amount: 1,
          target: 'self',
        })
      )
    })
  }

  get actions() {
    const actions: PhaseAction[] = [
      {
        type: 'end',
        execute: (coordinator) =>
          coordinator.toNext(createDoomPhase(this.context)),
      },
    ]
    return actions
  }
}

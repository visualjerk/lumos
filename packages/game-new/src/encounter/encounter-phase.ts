import { Context } from '../context'
import { createEffectPhase } from '../effect'
import { GamePhaseCoordinator } from '../game'
import { createInvestigatorPhase } from '../investigator'
import { PhaseAction, PhaseBase } from '../phase'

export function createEncounterPhase(context: Context) {
  return new EncounterPhase(context)
}

export class EncounterPhase implements PhaseBase {
  type = 'encounter'

  constructor(public context: Context) {}

  onEnter(coordinator: GamePhaseCoordinator) {
    this.context.investigators.forEach(({ id }) => {
      coordinator = coordinator.waitFor(
        createEffectPhase(this.context, id, {
          type: 'drawEncounter',
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
          coordinator.toNext(createInvestigatorPhase(this.context)),
      },
    ]
    return actions
  }
}

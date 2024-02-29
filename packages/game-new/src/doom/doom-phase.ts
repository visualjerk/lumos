import { Context } from '../context'
import { createEncounterPhase } from '../encounter'
import { createEndPhase } from '../end'
import { PhaseAction, PhaseBase } from '../phase'

export type DoomPhase = IncreaseDoomPhase | AdvanceDoomPhase

export function createDoomPhase(context: Context) {
  return new IncreaseDoomPhase(context)
}

export class IncreaseDoomPhase implements PhaseBase {
  type = 'doom'

  constructor(public context: Context) {}

  private get doomState() {
    return this.context.doomState
  }

  get actions() {
    const actions: PhaseAction[] = [
      {
        type: 'increaseDoom',
        execute: (coordinator) =>
          coordinator
            .apply(() => {
              this.doomState.increaseDoom()
            })
            .toNext(() => {
              if (this.doomState.hasReachedThreshold) {
                return createAdvanceDoomPhase(this.context)
              }
              return createEncounterPhase(this.context)
            }),
      },
    ]
    return actions
  }
}

export function createAdvanceDoomPhase(context: Context) {
  return new AdvanceDoomPhase(context)
}

export class AdvanceDoomPhase implements PhaseBase {
  type = 'advanceDoom'

  constructor(public context: Context) {}

  private get doomState() {
    return this.context.doomState
  }

  get actions() {
    const actions: PhaseAction[] = [
      {
        type: 'advanceDoom',
        execute: (coordinator) => {
          if (!this.doomState.hasNextDoomCard) {
            coordinator.toNext(createEndPhase(this.context))
            return
          }
          coordinator
            .apply(() => {
              this.doomState.advanceDoomCards()
            })
            .toNext(createEncounterPhase(this.context))
        },
      },
    ]
    return actions
  }
}

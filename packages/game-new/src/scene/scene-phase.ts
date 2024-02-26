import { Context } from '../context'
import { createEndPhase } from '../end'
import { PhaseAction, PhaseBase } from '../phase'

export type ScenePhase = AdvanceScenePhase

export function createScenePhase(context: Context) {
  return new AdvanceScenePhase(context)
}

export class AdvanceScenePhase implements PhaseBase {
  type = 'advanceScene'
  constructor(public context: Context) {}

  private get sceneState() {
    return this.context.sceneState
  }

  get actions() {
    const actions: PhaseAction[] = [
      {
        type: 'advanceScene',
        execute: (coordinator) => {
          if (!this.sceneState.hasNextSceneCard) {
            coordinator.toNext(createEndPhase(this.context))
            return
          }
          coordinator
            .apply(() => {
              // TODO: let players choose how to distribute clues
              this.context.investigatorStates.forEach((investigatorState) => {
                investigatorState.clues = 0
              })
              this.sceneState.advanceSceneCards()
            })
            .toParent()
        },
      },
    ]
    return actions
  }
}

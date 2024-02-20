import { Context, InvestigatorId } from '@lumos/game'
import {
  InvestigatorTargetScope,
  createInvestigatorTargetPhase,
} from '../target'
import { CreateAction } from './action'
import { GamePhaseCoordinator } from '../game'
import { PhaseBase, PhaseResult } from '../phase'

export type DrawAction = CreateAction<'draw'> & {
  cardAmount: number
  investigatorTarget: InvestigatorTargetScope
}

export function createDrawActionPhase(
  context: Context,
  investigatorId: InvestigatorId,
  action: DrawAction
): DrawActionPhase {
  return new DrawActionPhase(context, investigatorId, action)
}

export class DrawActionPhase implements PhaseBase {
  type = 'draw'
  actions = []

  constructor(
    public context: Context,
    public investigatorId: InvestigatorId,
    public action: DrawAction
  ) {}

  onEnter(coordinator: GamePhaseCoordinator<[], PhaseResult>) {
    return coordinator
      .waitFor(
        createInvestigatorTargetPhase(this.context, this.investigatorId, {
          type: 'investigator',
          scope: this.action.investigatorTarget,
        })
      )
      .apply(([{ investigatorId }]) => {
        const investigatorState =
          this.context.getInvestigatorState(investigatorId)
        for (let i = 0; i < this.action.cardAmount; i++) {
          if (investigatorState.canDraw()) {
            investigatorState.draw()
          }
        }
      })
      .toParent()
  }
}

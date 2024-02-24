import {
  InvestigatorTargetScope,
  createInvestigatorTargetPhase,
} from '../target'
import { CreateAction } from './action'
import { GamePhaseCoordinator } from '../game'
import { PhaseBase, PhaseResult } from '../phase'
import { Context } from '../context'
import { InvestigatorId } from '../investigator'

export type DrawAction = CreateAction<'draw'> & {
  amount: number
  target: InvestigatorTargetScope
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
    coordinator
      .waitFor(
        createInvestigatorTargetPhase(this.context, this.investigatorId, {
          type: 'investigator',
          scope: this.action.target,
        })
      )
      .apply(([{ investigatorId }]) => {
        const investigatorState =
          this.context.getInvestigatorState(investigatorId)
        for (let i = 0; i < this.action.amount; i++) {
          if (investigatorState.canDraw()) {
            investigatorState.draw()
          }
        }
      })
      .toParent()
  }
}

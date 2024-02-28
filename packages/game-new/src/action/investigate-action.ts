import { PhaseBase, PhaseResult } from '../phase'
import { SkillCheck, createSkillCheckPhase } from '../skill-check'
import { GamePhaseCoordinator } from '../game'
import {
  InvestigatorTarget,
  LocationTarget,
  createInvestigatorTargetPhase,
  createLocactionTargetPhase,
} from '../target'
import { CreateAction } from './action'
import { Context } from '../context'
import { InvestigatorId } from '../investigator'

export type InvestigateAction = CreateAction<'investigate'> & {
  clueAmount: number
  locationTarget: LocationTarget
  investigatorTarget: InvestigatorTarget
}

export function createInvestigateActionPhase(
  context: Context,
  investigatorId: InvestigatorId,
  action: InvestigateAction
): InvestigateActionPhase {
  return new InvestigateActionPhase(context, investigatorId, action)
}

export class InvestigateActionPhase implements PhaseBase {
  type = 'investigate'
  actions = []

  constructor(
    public context: Context,
    public investigatorId: InvestigatorId,
    public action: InvestigateAction
  ) {}

  onEnter(coordinator: GamePhaseCoordinator<[], PhaseResult>) {
    coordinator
      .waitFor(
        createInvestigatorTargetPhase(
          this.context,
          this.investigatorId,
          this.action.investigatorTarget
        )
      )
      .waitFor(
        createLocactionTargetPhase(
          this.context,
          this.investigatorId,
          this.action.locationTarget
        )
      )
      .waitFor(([{ investigatorId }, { locationId }]) => {
        const location = this.context.getLocation(locationId)

        const skillCheck: SkillCheck = {
          investigatorId,
          skill: 'intelligence',
          difficulty: location.shroud,
          onSuccess: {
            type: 'collectClue',
            amount: this.action.clueAmount,
            locationTarget: { locationId },
            investigatorTarget: { investigatorId },
          },
        }

        return createSkillCheckPhase(this.context, skillCheck)
      })
      .toParent()
  }
}

import { Context } from '@lumos/game'
import { PhaseBase, PhaseResult } from '../phase'
import { SkillCheck, createSkillCheckPhase } from '../skill-check'
import { GamePhaseCoordinator } from '../game'
import {
  InvestigatorTargetScope,
  LocationTargetScope,
  createInvestigatorTargetPhase,
  createLocactionTargetPhase,
} from '../target'
import { CreateAction } from './action'

export type InvestigateAction = CreateAction<'investigate'> & {
  clueAmount: number
  locationTarget: LocationTargetScope
  investigatorTarget: InvestigatorTargetScope
}

export function createInvestigateActionPhase(
  context: Context,
  action: InvestigateAction
): InvestigateActionPhase {
  return new InvestigateActionPhase(context, action)
}

export class InvestigateActionPhase implements PhaseBase {
  type = 'investigate'
  actions = []

  constructor(public context: Context, public action: InvestigateAction) {}

  onEnter(coordinator: GamePhaseCoordinator<[], PhaseResult>) {
    const investigatorId = this.context.investigators[0].id

    return coordinator
      .waitFor(
        createInvestigatorTargetPhase(this.context, investigatorId, {
          type: 'investigator',
          scope: this.action.investigatorTarget,
        })
      )
      .waitFor(
        createLocactionTargetPhase(this.context, investigatorId, {
          type: 'location',
          scope: this.action.locationTarget,
        })
      )
      .waitFor(([{ investigatorId }, { locationId }]) => {
        const location = this.context.getLocation(locationId)

        const skillCheck: SkillCheck = {
          investigatorId,
          skill: 'intelligence',
          difficulty: location.shroud,
          onFailure: () => {},
          onSuccess: () => {
            for (let i = 0; i < this.action.clueAmount; i++) {
              this.context.collectClue(investigatorId, locationId)
            }
          },
        }

        return createSkillCheckPhase(this.context, skillCheck)
      })
      .toParent()
  }
}

import {
  Context,
  InvestigatorId,
  InvestigatorState,
  isConnected,
} from '@lumos/game'
import { PhaseBase, PhaseAction } from '../phase'
import { TargetPhase_TEST_REMOVE_ME } from '../target'
import { createActionPhase } from '../action'

export function createInvestigatorPhase(context: Context) {
  return new InvestigatorPhase(context)
}

export const INVESTIGATOR_ACTIONS_PER_TURN = 3

export class InvestigatorPhase implements PhaseBase {
  type = 'investigator'
  actionsMade: number = 0
  investigatorId: InvestigatorId

  constructor(public context: Context) {
    // TODO: support multiple investigators
    this.investigatorId = context.investigators[0].id
  }

  get actions() {
    const actions: PhaseAction[] = []

    actions.push({
      type: 'end',
      execute: (coordinator) => coordinator.toNext(new EndPhase(this.context)),
    })

    if (this.actionsMade >= INVESTIGATOR_ACTIONS_PER_TURN) {
      return actions
    }

    actions.push(...this.generalActions)
    actions.push(...this.locationActions)

    return actions
  }

  private get investigatorState(): InvestigatorState {
    return this.context.getInvestigatorState(this.investigatorId)
  }

  private get generalActions(): PhaseAction[] {
    const actions: PhaseAction[] = []

    actions.push({
      type: 'attack',
      execute: (coordinator) =>
        coordinator
          .waitFor(new TargetPhase_TEST_REMOVE_ME(this.context))
          .apply(([{ investigatorId }]) => {
            this.context.investigatorStates.get(investigatorId!)?.addDamage(1)
            this.actionsMade++
          }),
    })

    if (this.investigatorState.canDraw()) {
      actions.push({
        type: 'draw',
        investigatorId: this.investigatorId,
        execute: (coordinator) =>
          coordinator
            .waitFor(
              createActionPhase(this.context, this.investigatorId, {
                type: 'draw',
                cardAmount: 1,
                investigatorTarget: 'self',
              })
            )
            .apply(() => {
              this.actionsMade++
            }),
      })
    }

    return actions
  }

  private get locationActions(): PhaseAction[] {
    const actions: PhaseAction[] = []

    const currentLocation = this.context.getLocation(
      this.investigatorState.currentLocation
    )

    const connectedLocations = this.context.scenario.locationCards.filter(
      ({ id }) => {
        const location = this.context.getLocation(id)
        return isConnected(currentLocation, location)
      }
    )

    connectedLocations.forEach((location) => {
      actions.push({
        type: 'move',
        locationId: location.id,
        execute: (coordinator) =>
          coordinator.apply(() => {
            this.context.moveInvestigator(this.investigatorId, location.id)
            this.actionsMade++
          }),
      })
    })

    if (this.context.locationStates.get(currentLocation.id)!.clues > 0) {
      actions.push({
        type: 'investigate',
        execute: (coordinator) =>
          coordinator
            .waitFor(
              createActionPhase(this.context, this.investigatorId, {
                type: 'investigate',
                clueAmount: 1,
                locationTarget: 'current',
                investigatorTarget: 'self',
              })
            )
            .apply(() => {
              this.actionsMade++
            }),
      })
    }

    return actions
  }
}

export class EndPhase implements PhaseBase {
  type = 'end'

  constructor(public context: Context) {}

  get actions() {
    return []
  }
}

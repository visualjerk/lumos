import {
  Context,
  InvestigatorId,
  InvestigatorState,
  isConnected,
} from '@lumos/game'
import { PhaseBase, Action } from '../phase'
import { TargetPhase } from '../target'

export function createInvestigatorPhase(context: Context) {
  return new InvestigatorPhase(context)
}

export const INVESTIGATOR_ACTIONS_PER_TURN = 3

export class InvestigatorPhase implements PhaseBase {
  type = 'investigator'
  public actionsMade: number = 0
  public investigatorId: InvestigatorId

  constructor(private context: Context) {
    // TODO: support multiple investigators
    this.investigatorId = context.investigators[0].id
  }

  get actions() {
    const actions: Action[] = []

    actions.push({
      type: 'end',
      execute: (e) => e.toNext(new EndPhase(this.context)),
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

  private get generalActions(): Action[] {
    const actions: Action[] = []

    actions.push({
      type: 'attack',
      execute: (e) =>
        e
          .waitFor(new TargetPhase(this.context))
          .apply(([{ investigatorId }]) => {
            this.context.investigatorStates.get(investigatorId!)?.addDamage(1)
            this.actionsMade++
          }),
    })

    if (this.investigatorState.canDraw()) {
      actions.push({
        type: 'draw',
        investigatorId: this.investigatorId,
        execute: (e) =>
          e.apply(() => {
            this.investigatorState.draw()
            this.actionsMade++
          }),
      })
    }

    return actions
  }

  private get locationActions(): Action[] {
    const actions: Action[] = []

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
        execute: (e) =>
          e.apply(() => {
            this.context.moveInvestigator(this.investigatorId, location.id)
            this.actionsMade++
          }),
      })
    })

    if (this.context.locationStates.get(currentLocation.id)!.clues > 0) {
      actions.push({
        type: 'investigate',
        execute: (e) =>
          e.apply(() => {
            this.context.collectClue(this.investigatorId, currentLocation.id)
            this.actionsMade++
          }),
      })
    }

    return actions
  }
}

export class EndPhase implements PhaseBase {
  type = 'end'

  constructor(private context: Context) {}

  get actions() {
    return []
  }
}

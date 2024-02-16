import { Context, Investigator, InvestigatorId, isConnected } from '@lumos/game'
import { PhaseBase, Action } from '../phase'
import { TargetPhase } from '../target'

export function createInvestigatorPhase(context: Context) {
  return new InvestigatorPhase(context)
}

export class InvestigatorPhase implements PhaseBase {
  type = 'investigator'
  public actionCount: number = 0
  public investigatorId: InvestigatorId

  constructor(private context: Context) {
    // TODO: support multiple investigators
    this.investigatorId = context.investigators[0].id
  }

  get actions() {
    const actions: Action[] = []

    if (this.actionCount < 3) {
      actions.push({
        type: 'attack',
        execute: (e) =>
          e
            .waitFor(new TargetPhase(this.context))
            .apply(([{ investigatorId }]) => {
              this.context.investigatorStates.get(investigatorId!)?.addDamage(1)
              this.actionCount++
            }),
      })
      actions.push(...this.locationActions)
    }

    actions.push({
      type: 'end',
      execute: (e) => e.toNext(new EndPhase(this.context)),
    })
    return actions
  }

  private get locationActions(): Action[] {
    const investigatorState = this.context.investigatorStates.get(
      this.investigatorId
    )
    const connectedLocations = this.context.scenario.locationCards.filter(
      ({ id }) => {
        const currentLocation = this.context.getLocation(
          investigatorState!.currentLocation
        )
        const location = this.context.getLocation(id)
        return isConnected(currentLocation, location)
      }
    )
    return connectedLocations.map((location) => ({
      type: 'move',
      locationId: location.id,
      execute: (e) =>
        e.apply(() => {
          this.context.moveInvestigator(this.investigatorId, location.id)
        }),
    }))
  }
}

export class EndPhase implements PhaseBase {
  type = 'end'

  constructor(private context: Context) {}

  get actions() {
    return []
  }
}

import { PhaseAction, PhaseBase } from '../phase'
import { GamePhaseCoordinator } from '../game'
import { LocationId } from '../location'
import { Context } from '../context'
import { InvestigatorId } from '../investigator'

export type LocationTargetScope = 'current'

export type LocationTarget = {
  type: 'location'
  scope: LocationTargetScope
}

export type LocationTargetResult = {
  locationId: LocationId
}

export function createLocactionTargetPhase(
  context: Context,
  investigatorId: InvestigatorId,
  locationTarget: LocationTarget
): LocationTargetPhase {
  return new LocationTargetPhase(context, investigatorId, locationTarget)
}

export class LocationTargetPhase implements PhaseBase<LocationTargetResult> {
  type = 'locationTarget'

  constructor(
    public context: Context,
    public investigatorId: InvestigatorId,
    public locationTarget: LocationTarget
  ) {}

  onEnter(gameExecute: GamePhaseCoordinator<[], LocationTargetResult>) {
    // Instantly resolve if scope is the current location
    if (this.locationTarget.scope === 'current') {
      const currentLocation = this.context.getInvestigatorLocation(
        this.investigatorId
      )
      gameExecute.applyToParent(() => ({
        locationId: currentLocation.id,
      }))
    }
  }

  get actions() {
    const actions: PhaseAction<LocationTargetResult>[] = []

    return actions
  }
}

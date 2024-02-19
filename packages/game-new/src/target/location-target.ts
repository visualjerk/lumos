import { Context, InvestigatorId, LocationId } from '@lumos/game'
import { PhaseAction, PhaseBase } from '../phase'
import { GameExecute } from '../game'

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

  onEnter(gameExecute: GameExecute<[], LocationTargetResult>) {
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

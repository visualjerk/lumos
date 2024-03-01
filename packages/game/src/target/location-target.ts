import { PhaseAction, PhaseBase } from '../phase'
import { GamePhaseCoordinator } from '../game'
import { LocationId } from '../location'
import { Context } from '../context'
import { InvestigatorId } from '../investigator'

export type LocationTargetScope = 'current'

export type LocationTarget = LocationTargetScope | LocationTargetResult

export type LocationTargetResult = {
  locationId: LocationId
}

function isLocationTargetResult(
  target: LocationTarget
): target is LocationTargetResult {
  return typeof target === 'object' && 'locationId' in target
}

export function createLocactionTargetPhase(
  context: Context,
  investigatorId: InvestigatorId,
  locationTarget: LocationTarget
): LocationTargetPhase {
  return new LocationTargetPhase(context, investigatorId, locationTarget)
}

export class LocationTargetPhase implements PhaseBase<LocationTargetResult> {
  type = 'locationTarget' as const

  constructor(
    public context: Context,
    public investigatorId: InvestigatorId,
    public locationTarget: LocationTarget
  ) {}

  onEnter(coordinator: GamePhaseCoordinator<[], LocationTargetResult>) {
    const target = this.locationTarget

    // Instantly resolve if target is a result
    if (isLocationTargetResult(target)) {
      coordinator.applyToParent(() => target)
      return
    }

    // Instantly resolve if scope is the current location
    if (target === 'current') {
      const currentLocation = this.context.getInvestigatorLocation(
        this.investigatorId
      )
      coordinator.applyToParent(() => ({
        locationId: currentLocation.id,
      }))
      return
    }
  }

  get actions() {
    const actions: PhaseAction<LocationTargetResult>[] = []

    return actions
  }
}

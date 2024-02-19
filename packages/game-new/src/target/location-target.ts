import { Context, InvestigatorId, LocationId } from '@lumos/game'
import { PhaseAction, PhaseBase, PhaseResult } from '../phase'
import { GameExecute } from '../game'

export type LocationTargetScope = 'current'

export type LocationTarget = {
  type: 'location'
  scope: LocationTargetScope
}

export type LocationTargetResult = {
  locationId: LocationId
}

export function executeTargetLocation(
  e: GameExecute<[], PhaseResult, []>,
  context: Context,
  investigatorId: InvestigatorId,
  locationTarget: LocationTarget
) {
  // Instantly resolve if scope is the current location
  if (locationTarget.scope === 'current') {
    const currentLocation = context.getInvestigatorLocation(investigatorId)
    return e.addResult({
      locationId: currentLocation.id,
    })
  }
  return e.waitFor(
    new LocationTargetPhase(context, investigatorId, locationTarget)
  )
}

export class LocationTargetPhase implements PhaseBase<LocationTargetResult> {
  type = 'locationTarget'

  constructor(
    private context: Context,
    private investigatorId: InvestigatorId,
    private locationTarget: LocationTarget
  ) {}

  get actions() {
    const actions: PhaseAction<LocationTargetResult>[] = []

    return actions
  }
}

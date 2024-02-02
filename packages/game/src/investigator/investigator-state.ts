import type { LocationId } from '../location'
import type { Investigator, InvestigatorId } from './investigator'

export type InvestigatorState = {
  currentHealth: number
  clues: number
  currentLocation: LocationId
}

export class InvestigatorStates extends Map<InvestigatorId, InvestigatorState> {
  constructor(investigators: Investigator[], currentLocation: LocationId) {
    super(
      investigators.map((investigator) => [
        investigator.id,
        {
          currentHealth: investigator.health,
          clues: 0,
          currentLocation,
        },
      ])
    )
  }
}

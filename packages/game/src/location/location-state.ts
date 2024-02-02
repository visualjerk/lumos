import type { LocationId, LocationCard } from './location-card'

export type LocationState = {
  revealed: boolean
  clues: number
}

export class LocationStates extends Map<LocationId, LocationState> {
  constructor(locations: LocationCard[]) {
    super(
      locations.map((location) => [
        location.id,
        { revealed: false, investigatorIds: [], clues: location.initialClues },
      ])
    )
  }
}

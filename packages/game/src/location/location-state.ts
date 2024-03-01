import { LocationId, LocationCard } from './location-card'

export type LocationState = {
  revealed: boolean
  clues: number
}

export class LocationStates extends Map<LocationId, LocationState> {}

export function createInitialLocationStates(
  locations: LocationCard[],
  startLocation: LocationId
): LocationStates {
  return new LocationStates(
    locations.map((location) => [
      location.id,
      {
        revealed: location.id === startLocation,
        clues: location.initialClues,
      },
    ])
  )
}

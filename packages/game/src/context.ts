import { LocationCard, LocationId } from './location'
import { Investigator, InvestigatorId } from './investigator'
import { Scenario } from './scenario'

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

export type Context = {
  scenario: Scenario
  locationStates: LocationStates
  investigators: Investigator[]
  investigatorStates: InvestigatorStates
}

export function createInitialContext(
  scenario: Scenario,
  investigators: Investigator[]
): Context {
  const locationStates = new LocationStates(scenario.locationCards)
  const investigatorStates = new InvestigatorStates(
    investigators,
    scenario.startLocation
  )
  locationStates.get(scenario.startLocation)!.revealed = true

  return {
    scenario,
    locationStates,
    investigators,
    investigatorStates,
  }
}

export function getLocationInvestigators(
  context: Context,
  locationId: LocationId
): Investigator[] {
  const investigators: Investigator[] = []
  context.investigatorStates.forEach((investigatorState, investigatorId) => {
    if (investigatorState.currentLocation !== locationId) {
      return
    }
    investigators.push(getInvestigator(context, investigatorId)!)
  })

  return investigators
}

export function getInvestigator(
  context: Context,
  investigatorId: InvestigatorId
) {
  return context.investigators.find(
    (investigator) => investigator.id === investigatorId
  )!
}

export function moveInvestigator(
  context: Context,
  investigatorId: InvestigatorId,
  locationId: LocationId
): Context {
  const investigatorState = context.investigatorStates.get(investigatorId)
  const locationState = context.locationStates.get(locationId)

  if (!investigatorState) {
    throw new Error('Investigator not found')
  }

  if (!locationState) {
    throw new Error('Location not found')
  }

  investigatorState.currentLocation = locationId
  locationState.revealed = true

  return context
}

export function getLocation(context: Context, locationId: LocationId) {
  return context.scenario.locationCards.find(
    (location) => location.id === locationId
  )!
}

export function getInvestigatorLocation(
  context: Context,
  investigatorId: InvestigatorId
) {
  const investigator = context.investigatorStates.get(investigatorId)

  if (!investigator) {
    throw new Error('Investigator not found')
  }

  const location = getLocation(context, investigator.currentLocation)

  if (!location) {
    throw new Error('Location not found')
  }

  return location
}

export function collectClue(
  context: Context,
  investigatorId: InvestigatorId,
  locationId: LocationId
): Context {
  const investigator = context.investigatorStates.get(investigatorId)
  const location = context.locationStates.get(locationId)

  if (!investigator) {
    throw new Error('Investigator not found')
  }

  if (!location) {
    throw new Error('Location not found')
  }

  if (!location.revealed) {
    throw new Error('Location not revealed')
  }

  if (location.clues === 0) {
    throw new Error('Location has no clues')
  }

  location.clues--
  investigator.clues++

  return context
}

export function getInvestigatorState(
  context: Context,
  investigatorId: InvestigatorId
) {
  return context.investigatorStates.get(investigatorId)!
}

export function getLocationState(context: Context, locationId: LocationId) {
  return context.locationStates.get(locationId)!
}

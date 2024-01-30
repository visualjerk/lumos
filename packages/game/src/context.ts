import {
  InvestigatorCard,
  InvestigatorId,
  LocationCard,
  LocationId,
} from './card'
import { Scenario } from './scenario'

export type LocationState = {
  revealed: boolean
  investigatorIds: InvestigatorId[]
}

export class LocationStates extends Map<LocationId, LocationState> {
  constructor(locations: LocationCard[]) {
    super(
      locations.map((location) => [
        location.id,
        { revealed: false, investigatorIds: [] },
      ])
    )
  }

  addInvestigator(locationId: LocationId, investigatorId: InvestigatorId) {
    const state = this.get(locationId)

    if (!state) {
      throw new Error('Location not found')
    }

    state.revealed = true
    state.investigatorIds.push(investigatorId)
  }

  removeInvestigator(locationId: LocationId, investigatorId: InvestigatorId) {
    const state = this.get(locationId)

    if (!state) {
      throw new Error('Location not found')
    }

    const index = state.investigatorIds.indexOf(investigatorId)

    if (index === -1) {
      throw new Error('Investigator not found')
    }

    state.investigatorIds.splice(index, 1)
  }
}

export type InvestigatorState = {
  currentHealth: number
}

export class InvestigatorStates extends Map<InvestigatorId, InvestigatorState> {
  constructor(investigators: InvestigatorCard[]) {
    super(
      investigators.map((investigator) => [
        investigator.id,
        { currentHealth: investigator.health },
      ])
    )
  }
}

export type Context = {
  scenario: Scenario
  locationStates: LocationStates
  investigatorCards: InvestigatorCard[]
  investigatorStates: InvestigatorStates
}

export function getLocationInvestigators(
  context: Context,
  locationId: LocationId
): InvestigatorCard[] {
  const state = context.locationStates.get(locationId)

  if (!state) {
    throw new Error('Location not found')
  }

  return state.investigatorIds.map((id) => getInvestigator(context, id))
}

function getInvestigator(context: Context, investigatorId: InvestigatorId) {
  return context.investigatorCards.find(
    (investigator) => investigator.id === investigatorId
  )!
}

export function moveInvestigator(
  context: Context,
  investigatorId: InvestigatorId,
  locationId: LocationId
): Context {
  const currentLocation = getInvestigatorLocation(context, investigatorId)
  const location = getLocation(context, locationId)

  const newContext = {
    ...context,
  }
  newContext.locationStates.removeInvestigator(
    currentLocation.id,
    investigatorId
  )
  newContext.locationStates.addInvestigator(location.id, investigatorId)

  return newContext
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
  let location: LocationCard | undefined
  context.locationStates.forEach((state, locationId) => {
    if (state.investigatorIds.includes(investigatorId)) {
      location = getLocation(context, locationId)
    }
  })
  return location!
}

import { LocationCard, InvestigatorCard } from './card'
import { Scenario } from './scenario'

export type LocationState = {
  revealed: boolean
  investigators: InvestigatorCard[]
}

export class LocationStates extends Map<LocationCard, LocationState> {
  constructor(locations: LocationCard[]) {
    super(
      locations.map((location) => [
        location,
        { revealed: false, investigators: [] },
      ])
    )
  }

  mutate(location: LocationCard, mutation: Partial<LocationState>) {
    const state = this.get(location)

    if (!state) {
      throw new Error('Location not found')
    }

    Object.assign(state, mutation)
  }
}

export type InvestigatorState = {
  currentHealth: number
}

export class InvestigatorStates extends Map<
  InvestigatorCard,
  InvestigatorState
> {
  constructor(investigators: InvestigatorCard[]) {
    super(
      investigators.map((investigator) => [
        investigator,
        { currentHealth: investigator.health },
      ])
    )
  }
}

export class Game {
  scenario: Scenario
  locationStates: LocationStates
  investigatorStates: InvestigatorStates

  constructor(scenario: Scenario, investigatorCards: InvestigatorCard[]) {
    this.scenario = scenario
    this.locationStates = new LocationStates(scenario.locationCards)
    this.investigatorStates = new InvestigatorStates(investigatorCards)

    this.locationStates.mutate(scenario.startLocation, {
      revealed: true,
      investigators: investigatorCards,
    })
  }

  get locations() {
    return this.scenario.locationCards.map((location) => ({
      ...location,
      position: this.scenario.layout.get(location.id)!,
      state: this.locationStates.get(location)!,
    }))
  }

  // moveInvestigator(investigator: Investigator, location: Location) {
  //   const investigatorState = this.getInvestigatorState(investigator)
  //   const currentLocation = this.getLocation(investigatorState.locationId)

  //   if (!isConnected(currentLocation, location)) {
  //     throw new Error('Locations are not connected')
  //   }

  //   investigatorState.locationId = location.id
  // }
}

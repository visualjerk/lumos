'use client'

import {
  LocationCard,
  InvestigatorCard,
  InvestigatorId,
  LocationId,
  isConnected,
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

  mutate(locationId: LocationId, mutation: Partial<LocationState>) {
    const state = this.get(locationId)

    if (!state) {
      throw new Error('Location not found')
    }

    Object.assign(state, mutation)
  }

  addInvestigator(locationId: LocationId, investigatorId: InvestigatorId) {
    const state = this.get(locationId)

    if (!state) {
      throw new Error('Location not found')
    }

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

export type GameObserver = (game: Game) => void

export class Game {
  private scenario: Scenario
  private locationStates: LocationStates
  private investigators: InvestigatorCard[]
  private investigatorStates: InvestigatorStates
  private observers: GameObserver[] = []

  constructor(scenario: Scenario, investigatorCards: InvestigatorCard[]) {
    this.scenario = scenario
    this.locationStates = new LocationStates(scenario.locationCards)
    this.investigators = investigatorCards
    this.investigatorStates = new InvestigatorStates(investigatorCards)

    this.locationStates.mutate(scenario.startLocation, {
      revealed: true,
      investigatorIds: investigatorCards.map((investigator) => investigator.id),
    })
  }

  get locations() {
    return this.scenario.locationCards.map((location) => ({
      ...location,
      position: this.scenario.layout.get(location.id)!,
      state: this.locationStates.get(location.id)!,
      investigators: this.locationStates
        .get(location.id)!
        .investigatorIds.map((investigatorId) =>
          this.getInvestigator(investigatorId)
        ),
    }))
  }

  private getLocation(locationId: LocationId) {
    return this.locations.find((location) => location.id === locationId)!
  }

  private getInvestigator(investigatorId: InvestigatorId) {
    return this.investigators.find(
      (investigator) => investigator.id === investigatorId
    )!
  }

  private getInvestigatorLocation(investigatorId: InvestigatorId) {
    return this.locations.find((location) =>
      location.state.investigatorIds.includes(investigatorId)
    )!
  }

  moveInvestigator(investigatorId: InvestigatorId, locationId: LocationId) {
    const currentLocation = this.getInvestigatorLocation(investigatorId)
    const location = this.getLocation(locationId)

    if (!isConnected(currentLocation, location)) {
      throw new Error('Locations are not connected')
    }

    this.locationStates.removeInvestigator(currentLocation.id, investigatorId)
    this.locationStates.addInvestigator(location.id, investigatorId)
    this.onChange(this)
  }

  addObserver(observer: GameObserver) {
    this.observers.push(observer)
  }

  removeObserver(observer: GameObserver) {
    const index = this.observers.indexOf(observer)

    if (index === -1) {
      throw new Error('Observer not found')
    }

    this.observers.splice(index, 1)
  }

  private onChange(game: Game) {
    this.observers.forEach((observer) => observer(game))
  }
}

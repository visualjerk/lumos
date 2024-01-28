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

export type MoveAction = {
  type: 'move'
  investigatorId: InvestigatorId
  locationId: LocationId
  execute: () => void
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

    investigatorCards.forEach((investigator) => {
      this.locationStates.addInvestigator(
        scenario.startLocation,
        investigator.id
      )
    })
  }

  get locations() {
    return this.scenario.locationCards.map((location) => ({
      ...location,
      position: this.scenario.layout.get(location.id)!,
      state: this.locationStates.get(location.id)!,
      actions: this.getLocationActions(location.id, this.investigators[0].id),
      investigators: this.locationStates
        .get(location.id)!
        .investigatorIds.map((investigatorId) =>
          this.getInvestigator(investigatorId)
        ),
    }))
  }

  private getLocation(locationId: LocationId) {
    return this.scenario.locationCards.find(
      (location) => location.id === locationId
    )!
  }

  private getInvestigator(investigatorId: InvestigatorId) {
    return this.investigators.find(
      (investigator) => investigator.id === investigatorId
    )!
  }

  private getInvestigatorLocation(investigatorId: InvestigatorId) {
    let location: LocationCard | undefined
    this.locationStates.forEach((state, locationId) => {
      if (state.investigatorIds.includes(investigatorId)) {
        location = this.getLocation(locationId)
      }
    })
    return location!
  }

  getLocationActions(
    locationId: LocationId,
    investigatorId: InvestigatorId
  ): MoveAction[] {
    const actions: MoveAction[] = []

    const currentLocation = this.getInvestigatorLocation(investigatorId)
    const location = this.getLocation(locationId)

    if (isConnected(currentLocation, location)) {
      actions.push({
        type: 'move',
        investigatorId,
        locationId,
        execute: () => this.moveInvestigator(investigatorId, locationId),
      })
    }

    return actions
  }

  private moveInvestigator(
    investigatorId: InvestigatorId,
    locationId: LocationId
  ) {
    const currentLocation = this.getInvestigatorLocation(investigatorId)
    const location = this.getLocation(locationId)

    if (!isConnected(currentLocation, location)) {
      throw new Error('Locations are not connected')
    }

    this.locationStates.removeInvestigator(currentLocation.id, investigatorId)
    this.locationStates.addInvestigator(location.id, investigatorId)
    this.onChange(this)
  }

  subscribe(observer: GameObserver) {
    this.observers.push(observer)
    return () => this.unsubscribe(observer)
  }

  unsubscribe(observer: GameObserver) {
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

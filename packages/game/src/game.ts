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

export type Phase = 'investigation' | 'cleanup'

export type GameState = {
  phase: Phase
}

export type Action = {
  type: string
  execute: () => void
}

export type MoveAction = Action & {
  type: 'move'
  investigatorId: InvestigatorId
  locationId: LocationId
}

export type GameObserver = (game: Game) => void

export class Game {
  private scenario: Scenario
  private locationStates: LocationStates
  private investigatorCards: InvestigatorCard[]
  private investigatorStates: InvestigatorStates
  private gameState: GameState
  private observers: GameObserver[] = []

  constructor(scenario: Scenario, investigatorCards: InvestigatorCard[]) {
    this.scenario = scenario
    this.locationStates = new LocationStates(scenario.locationCards)
    this.investigatorCards = investigatorCards
    this.investigatorStates = new InvestigatorStates(investigatorCards)
    this.gameState = {
      phase: 'investigation',
    }

    investigatorCards.forEach((investigator) => {
      this.locationStates.addInvestigator(
        scenario.startLocation,
        investigator.id
      )
    })
  }

  get investigators() {
    return this.investigatorCards.map((investigator) => ({
      ...investigator,
      state: this.investigatorStates.get(investigator.id),
      actions: this.getInvestigatorActions(investigator.id),
    }))
  }

  getInvestigatorActions(_investigatorId: InvestigatorId): Action[] {
    const actions: Action[] = []

    if (this.gameState.phase === 'investigation') {
      actions.push({
        type: 'endInvestigationPhase',
        execute: () => this.endInvestigationPhase(),
      })
    } else if (this.gameState.phase === 'cleanup') {
      actions.push({
        type: 'endCleanupPhase',
        execute: () => this.endCleanupPhase(),
      })
    }

    return actions
  }

  endInvestigationPhase() {
    this.gameState.phase = 'cleanup'
    this.onChange(this)
  }

  endCleanupPhase() {
    this.gameState.phase = 'investigation'
    this.onChange(this)
  }

  get locations() {
    return this.scenario.locationCards.map((location) => ({
      ...location,
      position: this.scenario.layout.get(location.id)!,
      state: this.locationStates.get(location.id)!,
      actions: this.getLocationActions(
        location.id,
        this.investigatorCards[0].id
      ),
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
    return this.investigatorCards.find(
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

    if (this.gameState.phase !== 'investigation') {
      return actions
    }

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

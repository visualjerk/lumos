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

export type Action = {
  type: string
  execute: () => void
}

export type MoveAction = Action & {
  type: 'move'
  investigatorId: InvestigatorId
  locationId: LocationId
}

export type GameContext = {
  scenario: Scenario
  locationStates: LocationStates
  investigatorCards: InvestigatorCard[]
  investigatorStates: InvestigatorStates
}

export type PhaseActionReturn = {
  nextPhase?: Phase
  newContext?: GameContext
}

export type PhaseAction = {
  type: string
  locationId?: LocationId
  investigatorId?: InvestigatorId
  execute: () => PhaseActionReturn
}

export type PhaseType = 'investigation' | 'cleanup'

export type Phase = {
  type: PhaseType
  actions: PhaseAction[]
}

export class InvestigationPhase implements Phase {
  type = 'investigation' as const

  constructor(private context: GameContext) {}

  get actions() {
    const actions: PhaseAction[] = []

    // TODO: add current investigator
    const investigatorId = this.context.investigatorCards[0].id

    actions.push({
      type: 'endInvestigationPhase',
      investigatorId,
      execute: () => {
        return {
          nextPhase: new CleanupPhase(this.context),
        }
      },
    })

    this.context.locationStates.forEach((state, locationId) => {
      const locationActions = this.getLocationActions(
        locationId,
        investigatorId
      )
      actions.push(...locationActions)
    })

    return actions
  }

  getLocationActions(
    locationId: LocationId,
    investigatorId: InvestigatorId
  ): PhaseAction[] {
    const actions: PhaseAction[] = []

    const currentLocation = this.getInvestigatorLocation(investigatorId)
    const location = this.getLocation(locationId)

    if (isConnected(currentLocation, location)) {
      actions.push({
        type: 'move',
        investigatorId,
        locationId,
        execute: () => {
          const newContext = this.moveInvestigator(investigatorId, locationId)

          return {
            newContext,
          }
        },
      })
    }

    return actions
  }

  private moveInvestigator(
    investigatorId: InvestigatorId,
    locationId: LocationId
  ): GameContext {
    const currentLocation = this.getInvestigatorLocation(investigatorId)
    const location = this.getLocation(locationId)

    const newContext = {
      ...this.context,
    }
    newContext.locationStates.removeInvestigator(
      currentLocation.id,
      investigatorId
    )
    newContext.locationStates.addInvestigator(location.id, investigatorId)

    return newContext
  }

  private getLocation(locationId: LocationId) {
    return this.context.scenario.locationCards.find(
      (location) => location.id === locationId
    )!
  }

  private getInvestigatorLocation(investigatorId: InvestigatorId) {
    let location: LocationCard | undefined
    this.context.locationStates.forEach((state, locationId) => {
      if (state.investigatorIds.includes(investigatorId)) {
        location = this.getLocation(locationId)
      }
    })
    return location!
  }
}

export class CleanupPhase implements Phase {
  type = 'cleanup' as const

  constructor(private context: GameContext) {}

  get actions() {
    const actions: PhaseAction[] = []

    actions.push({
      type: 'endCleanupPhase',
      // TODO: add current investigator
      investigatorId: this.context.investigatorCards[0].id,
      execute: () => {
        return {
          nextPhase: new InvestigationPhase(this.context),
        }
      },
    })

    return actions
  }
}

export type GameObserver = (game: Game) => void

export class Game {
  private context: GameContext
  private phase: Phase
  private observers: GameObserver[] = []

  constructor(scenario: Scenario, investigatorCards: InvestigatorCard[]) {
    const locationStates = new LocationStates(scenario.locationCards)
    const investigatorStates = new InvestigatorStates(investigatorCards)

    investigatorCards.forEach((investigator) => {
      locationStates.addInvestigator(scenario.startLocation, investigator.id)
    })

    this.context = {
      scenario,
      locationStates,
      investigatorCards,
      investigatorStates,
    }

    this.phase = new InvestigationPhase(this.context)
  }

  get investigators() {
    return this.context.investigatorCards.map((investigator) => ({
      ...investigator,
      state: this.context.investigatorStates.get(investigator.id),
      actions: this.getInvestigatorActions(),
    }))
  }

  private getInvestigatorActions(): Action[] {
    return this.phase.actions
      .filter(
        (action) => action.investigatorId != null && action.locationId == null
      )
      .map((action) => ({
        ...action,
        execute: () => this.executePhaseAction(action),
      }))
  }

  get locations() {
    return this.context.scenario.locationCards.map((location) => ({
      ...location,
      position: this.context.scenario.layout.get(location.id)!,
      state: this.context.locationStates.get(location.id)!,
      actions: this.getLocationActions(location.id),
      investigators: this.context.locationStates
        .get(location.id)!
        .investigatorIds.map((investigatorId) =>
          this.getInvestigator(investigatorId)
        ),
    }))
  }

  private getLocationActions(locationId: LocationId): Action[] {
    return this.phase.actions
      .filter((action) => action.locationId === locationId)
      .map((action) => ({
        ...action,
        execute: () => this.executePhaseAction(action),
      }))
  }

  private executePhaseAction(action: PhaseAction) {
    const { nextPhase, newContext } = action.execute()
    if (nextPhase) {
      this.phase = nextPhase
    }
    if (newContext) {
      this.context = newContext
    }
    this.onChange(this)
  }

  private getInvestigator(investigatorId: InvestigatorId) {
    return this.context.investigatorCards.find(
      (investigator) => investigator.id === investigatorId
    )!
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

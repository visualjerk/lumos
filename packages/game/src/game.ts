import { Phase, PhaseAction, createInvestigationPhase } from './phase'
import {
  Context,
  createInitialContext,
  getLocationInvestigators,
} from './context'
import { LocationCard, InvestigatorCard, LocationId } from './card'
import { Position, Scenario } from './scenario'

export type Action = {
  type: string
  execute: () => void
}

export type GameObserver = (game: Game) => void

export type GameInvestigator = InvestigatorCard & {
  clues: number
  currentHealth: number
  actions: Action[]
}

export type GameLocation = LocationCard & {
  position: Position
  revealed: boolean
  clues: number
  actions: Action[]
  investigators: InvestigatorCard[]
}

export type Game = {
  investigators: GameInvestigator[]
  locations: GameLocation[]
  subscribe: (observer: GameObserver) => () => void
}

function createGameFromContext(context: Context, phase: Phase): Game {
  const investigators: GameInvestigator[] = context.investigatorCards.map(
    (investigator) => ({
      ...investigator,
      ...context.investigatorStates.get(investigator.id)!,
      actions: getInvestigatorActions(),
    })
  )

  function getInvestigatorActions(): Action[] {
    return phase.actions
      .filter(
        (action) => action.investigatorId != null && action.locationId == null
      )
      .map((action) => ({
        ...action,
        execute: () => executePhaseAction(action),
      }))
  }

  const locations: GameLocation[] = context.scenario.locationCards.map(
    (location) => ({
      ...location,
      ...context.locationStates.get(location.id)!,
      position: context.scenario.layout.get(location.id)!,
      actions: getLocationActions(location.id),
      investigators: getLocationInvestigators(context, location.id),
    })
  )

  function getLocationActions(locationId: LocationId): Action[] {
    return phase.actions
      .filter((action) => action.locationId === locationId)
      .map((action) => ({
        ...action,
        execute: () => executePhaseAction(action),
      }))
  }

  function executePhaseAction(action: PhaseAction) {
    const { nextPhase, newContext } = action.execute()

    if (nextPhase) {
      phase = nextPhase
    }
    if (newContext) {
      context = newContext
      phase = phase.applyContext(newContext)
    }

    onChange(createGameFromContext(context, phase))
  }

  const observers: GameObserver[] = []

  function subscribe(observer: GameObserver) {
    observers.push(observer)
    return () => unsubscribe(observer)
  }

  function unsubscribe(observer: GameObserver) {
    const index = observers.indexOf(observer)

    if (index === -1) {
      throw new Error('Observer not found')
    }

    observers.splice(index, 1)
  }

  function onChange(game: Game) {
    observers.forEach((observer) => observer(game))
  }

  return {
    investigators,
    locations,
    subscribe,
  }
}

export function createGame(
  scenario: Scenario,
  investigatorCards: InvestigatorCard[]
): Game {
  const context = createInitialContext(scenario, investigatorCards)
  const phase = createInvestigationPhase(context)

  return createGameFromContext(context, phase)
}

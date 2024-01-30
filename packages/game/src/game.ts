import { Phase, PhaseAction, createInvestigationPhase } from './phase'
import {
  Context,
  InvestigatorState,
  InvestigatorStates,
  LocationState,
  LocationStates,
} from './context'
import {
  LocationCard,
  InvestigatorCard,
  InvestigatorId,
  LocationId,
} from './card'
import { Position, Scenario } from './scenario'

export type Action = {
  type: string
  execute: () => void
}

export type GameObserver = (game: Game) => void

export type GameInvestigator = InvestigatorCard & {
  state: InvestigatorState
  actions: Action[]
}

export type GameLocation = LocationCard & {
  position: Position
  state: LocationState
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
      state: context.investigatorStates.get(investigator.id)!,
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
      position: context.scenario.layout.get(location.id)!,
      state: context.locationStates.get(location.id)!,
      actions: getLocationActions(location.id),
      investigators: context.locationStates
        .get(location.id)!
        .investigatorIds.map((investigatorId) =>
          getInvestigator(investigatorId)
        ),
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

  function getInvestigator(investigatorId: InvestigatorId) {
    return context.investigatorCards.find(
      (investigator) => investigator.id === investigatorId
    )!
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
  const locationStates = new LocationStates(scenario.locationCards)
  const investigatorStates = new InvestigatorStates(investigatorCards)

  investigatorCards.forEach((investigator) => {
    locationStates.addInvestigator(scenario.startLocation, investigator.id)
  })

  const context: Context = {
    scenario,
    locationStates,
    investigatorCards,
    investigatorStates,
  }

  const phase = createInvestigationPhase(context)

  return createGameFromContext(context, phase)
}

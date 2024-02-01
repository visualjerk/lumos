import { Phase, PhaseAction, createInvestigationPhase } from './phase'
import { createInitialContext } from './context'
import { LocationCard, InvestigatorCard } from './card'
import { Position, Scenario } from './scenario'

export type GameAction = Omit<PhaseAction, 'execute'> & {
  execute: () => void
}

export type GamePhase = Omit<Phase, 'actions'> & {
  actions: GameAction[]
}

export type GameObserver = (game: Game) => void

export type GameInvestigator = InvestigatorCard & {
  clues: number
  currentHealth: number
  actions: GameAction[]
}

export type GameLocation = LocationCard & {
  position: Position
  revealed: boolean
  clues: number
  actions: GameAction[]
  investigators: InvestigatorCard[]
}

export type Game = {
  phase: GamePhase
  subscribe: (observer: GameObserver) => () => void
}

function createGameFromPhase(phase: Phase): Game {
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

  function executePhaseAction(action: PhaseAction) {
    const nextPhase = action.execute()
    onChange(createGameFromPhase(nextPhase))
  }

  return {
    phase: {
      ...phase,
      actions: phase.actions.map((action) => ({
        ...action,
        execute: () => executePhaseAction(action),
      })),
    },
    subscribe,
  }
}

export function createGame(
  scenario: Scenario,
  investigatorCards: InvestigatorCard[]
): Game {
  const context = createInitialContext(scenario, investigatorCards)
  const phase = createInvestigationPhase(context)

  return createGameFromPhase(phase)
}

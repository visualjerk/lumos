import { Phase, PhaseAction, createInvestigatorPhase } from './phase'
import { createInitialContext } from './context'
import { Investigator } from './investigator'
import { Scenario } from './scenario'

type ReplacePropInUnion<T, Prop extends keyof T, PropType> = T extends any
  ? Omit<T, Prop> & { [K in Prop]: PropType }
  : never

export type GameAction = Omit<PhaseAction, 'execute'> & {
  execute: () => void
}

export type GamePhase = ReplacePropInUnion<Phase, 'actions', GameAction[]>

export type GamePhaseOf<TPhase extends Phase> = Omit<TPhase, 'actions'> & {
  actions: GameAction[]
}

export type GameObserver = (game: Game) => void

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
  investigators: Investigator[]
): Game {
  const context = createInitialContext(scenario, investigators)
  const phase = createInvestigatorPhase(context)

  return createGameFromPhase(phase)
}

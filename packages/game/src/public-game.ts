import { Context } from './context'
import { Game, GamePhase, createInitialGame } from './game'
import { Investigator } from './investigator'
import {
  Phase,
  PhaseAction,
  PhaseActionFilterParams,
  actionMatches,
} from './phase'
import { Scenario } from './scenario'

export function createInitialPublicGame(
  scenario: Scenario,
  investigators: Investigator[]
) {
  const game = createInitialGame(scenario, investigators)
  return new PublicGame(game)
}

export function getMatchingAction(
  actions: PublicPhaseAction[],
  filter: PhaseActionFilterParams | PhaseActionFilterParams[]
) {
  return actions.find((action) =>
    Array.isArray(filter)
      ? filter.some((singleFilter) => actionMatches(action, singleFilter))
      : actionMatches(action, filter)
  )
}

type ReplacePropInUnion<T, Prop extends keyof T, PropType> = T extends unknown
  ? Omit<T, Prop> & { [K in Prop]: PropType }
  : never

export type PublicPhaseAction = Omit<PhaseAction, 'execute'> & {
  execute: () => void
}

export type PublicPhaseOf<TPhase extends Phase> = Omit<TPhase, 'actions'> & {
  actions: PublicPhaseAction[]
}

export type PublicPhase = ReplacePropInUnion<
  Phase,
  'actions',
  PublicPhaseAction[]
>

export type PublicGameObserver = (game: PublicGame) => void

export class PublicGame {
  private observers: PublicGameObserver[] = []
  private canExecuteActions = true

  constructor(private game: Game) {}

  get phase(): PublicPhase {
    return this.convertToPublicPhase(this.game.phase)
  }

  get parentPhase(): PublicPhase {
    return this.convertToPublicPhase(this.game.parentPhase)
  }

  get actions(): PublicPhaseAction[] {
    return this.phase.actions
  }

  get context(): Context {
    return this.game.context
  }

  onChange(observer: PublicGameObserver) {
    this.observers.push(observer)
    return () => this.removeObserver(observer)
  }

  private convertToPublicPhase(phase: GamePhase): PublicPhase {
    // Create a Proxy that intercepts the `actions` property access
    const phaseProxy = new Proxy(phase, {
      get: (target, prop) => {
        if (prop === 'actions') {
          // Convert actions to PublicAction objects on-the-fly
          return target[prop].map((action) => ({
            ...action,
            execute: () => {
              if (!this.canExecuteActions) {
                return
              }
              this.canExecuteActions = false
              action.execute()
              this.notifyObservers()
              requestAnimationFrame(() => {
                this.canExecuteActions = true
                this.notifyObservers()
              })
            },
          }))
        }

        return target[prop as keyof GamePhase]
      },
    })

    return phaseProxy as PublicPhase
  }

  undo() {
    this.game = this.game.undo()
    this.notifyObservers()
  }

  get canUndo() {
    return this.game.canUndo
  }

  private notifyObservers() {
    this.observers.forEach((subscriber) => subscriber(this))
  }

  private removeObserver(observer: PublicGameObserver) {
    this.observers = this.observers.filter((s) => s !== observer)
  }
}

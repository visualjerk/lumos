import { Game, GamePhase } from './game'
import { Phase, PhaseAction } from './phase'

type ReplacePropInUnion<T, Prop extends keyof T, PropType> = T extends any
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
          return target[prop].map((action) => {
            action.execute()
            this.notifyObservers()
          })
        }
        return target[prop as keyof GamePhase]
      },
    })

    return phaseProxy as PublicPhase
  }

  private notifyObservers() {
    this.observers.forEach((subscriber) => subscriber(this))
  }

  private removeObserver(observer: PublicGameObserver) {
    this.observers = this.observers.filter((s) => s !== observer)
  }
}

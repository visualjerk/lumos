import { InvestigatorStates } from '@lumos/game'

export class Context {
  constructor(public investigatorStates: InvestigatorStates) {}
}

export type GamePhase = {
  type: string
  actions: GameAction[]
}

export type GameAction = {
  type: string
  execute: () => void
}

export class Game {
  context!: Context
  phases: GamePhase[] = []

  // Initializes the game with a context and a phase
  init(context: Context, phase: Phase): void {
    this.context = context
    this.addPhase(phase)
  }

  // Returns the current phase
  get phase(): GamePhase {
    return this.phases[this.phases.length - 1]
  }

  // Adds a phase to the game
  addPhase(phase: Phase): void {
    this.phases.push(this.convertToGamePhase(phase))
  }

  addGamePhase(phase: GamePhase): void {
    this.phases.push(phase)
  }

  // Converts a Phase to a GamePhase
  private convertToGamePhase(phase: Phase): GamePhase {
    // Create a Proxy that intercepts the `actions` property access
    const phaseProxy = new Proxy(phase, {
      get: (target, prop) => {
        if (prop === 'actions') {
          // Convert actions to GameAction objects on-the-fly
          return target[prop].map((action) => this.convertToGameAction(action))
        }
        return target[prop as keyof Phase]
      },
    })

    return phaseProxy as GamePhase
  }

  // Converts an Action to a GameAction
  private convertToGameAction(action: Action): GameAction {
    return {
      type: action.type,
      execute: this.wrapExecute(action.execute),
    }
  }

  // Wraps the execute function to handle subphases
  private wrapExecute(
    execute: ExecuteAction | ExecuteAction[]
  ): () => void | Phase {
    if (Array.isArray(execute)) {
      return this.wrapMultipleExecutes(execute)
    }

    return this.wrapMultipleExecutes([execute])
  }

  // Wraps multiple execute functions
  private wrapMultipleExecutes(execute: ExecuteAction[]): () => void | Phase {
    return () => this.executeSequentially(execute, 0)
  }

  // Executes actions sequentially
  private executeSequentially(
    execute: ExecuteAction[],
    index: number,
    previousPhases: Phase[] = []
  ): void | Phase {
    if (index >= execute.length) {
      return
    }

    const subPhase = execute[index](...previousPhases)

    if (subPhase) {
      const newPhase = {
        ...subPhase,
        actions: subPhase.actions.map((action) => {
          return {
            ...action,
            execute: () => {
              this.phases.pop()
              const newSubphase = this.wrapExecute(action.execute)()

              if (!newSubphase) {
                this.executeSequentially(execute, index + 1, [
                  ...previousPhases,
                  subPhase,
                ])
              }
            },
          }
        }),
      }
      this.addGamePhase(newPhase)
      return subPhase
    } else {
      return this.executeSequentially(execute, index + 1, previousPhases)
    }
  }
}
export type Phase = InvestigatorPhase | EndPhase | TargetPhase | DamagePhase

export type PhaseBase = {
  type: string
  actions: Action[]
}

export type Action = {
  type: string
  execute: ExecuteAction | ExecuteAction[]
}

export type ExecuteAction = (...args: any[]) => Phase | void

export class InvestigatorPhase implements PhaseBase {
  type = 'investigator'
  public actionCount: number = 0

  constructor(private game: Game, private context: Context) {}

  get actions() {
    const actions: Action[] = []

    if (this.actionCount < 3) {
      actions.push({
        type: 'damage',
        execute: [
          () => new TargetPhase(this.game, this.context),
          ({ investigatorId }) => {
            this.context.investigatorStates.get(investigatorId)?.addDamage(1)
            this.actionCount++
            return this
          },
        ],
      })

      actions.push({
        type: 'variable-damage',
        execute: [
          () => new TargetPhase(this.game, this.context),
          () => new DamagePhase(this.game, this.context),
          ({ investigatorId }, { damage }) => {
            console.log('damage', investigatorId, damage)
            this.context.investigatorStates
              .get(investigatorId)
              ?.addDamage(damage)
            this.actionCount++
            return this
          },
        ],
      })
    }

    actions.push({
      type: 'end',
      execute: () => new EndPhase(this.game, this.context),
    })
    return actions
  }
}

export class TargetPhase implements PhaseBase {
  type = 'target'
  public investigatorId?: string

  constructor(private game: Game, private context: Context) {}

  get actions() {
    return [...this.context.investigatorStates.keys()].map(
      (investigatorId) => ({
        type: 'target',
        execute: () => {
          this.investigatorId = investigatorId
        },
      })
    )
  }
}

export class DamagePhase implements PhaseBase {
  type = 'damage'
  public damage: number = 2

  constructor(private game: Game, private context: Context) {}

  get actions() {
    return [
      {
        type: 'increase',
        execute: () => {
          this.damage++
        },
      },
      {
        type: 'increaseOnce',
        execute: () => {
          this.damage++
          return this
        },
      },
    ]
  }
}

export class EndPhase implements PhaseBase {
  type = 'end'

  constructor(private game: Game, private context: Context) {}

  get actions() {
    return []
  }
}

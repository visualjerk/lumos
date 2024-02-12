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

type ExecuteContext = {
  phases: Phase[]
  executes: ExecuteAction[]
}

export class Game {
  context!: Context
  _phase!: GamePhase
  executeContexts: ExecuteContext[] = []

  // Initializes the game with a context and a phase
  init(context: Context, phase: Phase): void {
    this.context = context
    this.setPhase(phase)
  }

  // Returns the current phase
  get phase(): GamePhase {
    return this._phase
  }

  // Adds a phase to the game
  private setPhase(phase: Phase): void {
    this._phase = this.convertToGamePhase(phase)
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
      execute: () => this.wrapExecute(action.execute),
    }
  }

  // Wraps the execute function to handle subphases
  private wrapExecute(execute: ExecuteAction | ExecuteAction[]): void {
    const executes = Array.isArray(execute) ? [...execute].reverse() : [execute]
    this.executeContexts.push({
      executes,
      phases: [],
    })
    this.handleNextExecute()
  }

  private handleNextExecute(): void {
    const executeContext = this.getNextExecuteContext()

    if (!executeContext) {
      return
    }

    const nextExecute = executeContext.executes.pop()!
    const nextPhase = nextExecute(...executeContext.phases)

    if (nextPhase) {
      this.setPhase(nextPhase)
      executeContext.phases.push(nextPhase)
    } else {
      this.handleNextExecute()
    }
  }

  private getNextExecuteContext(): ExecuteContext | null {
    const executeContext = this.executeContexts.at(-1)

    if (!executeContext) {
      return null
    }

    if (executeContext.executes.length > 0) {
      return executeContext
    }

    // Cleanup empty executeContext
    this.executeContexts.pop()
    return this.getNextExecuteContext()
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

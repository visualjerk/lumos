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
  phases: Phase[] = []
  executeContexts: ExecuteContext[] = []

  // Initializes the game with a context and a phase
  init(context: Context, phase: Phase): void {
    this.context = context
    this.phases = [phase]
  }

  // Returns the current phase
  get phase(): GamePhase {
    return this.convertToGamePhase(this.phases.at(-1)!)
  }

  // Returns the current phase
  get parentPhase(): Phase {
    return this.phases[0]
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
    const result = nextExecute(...executeContext.phases)

    if (result == null) {
      return
    }

    if (result === 'previous') {
      if (this.phases.length < 2) {
        throw new Error(
          '"previous" is not allowed on an action in the parent phase.'
        )
      }

      this.phases.pop()
      this.handleNextExecute()
      return
    }

    if ('subphase' in result) {
      this.phases.push(result.subphase)
      executeContext.phases.push(result.subphase)
      return
    }

    if ('next' in result) {
      this.phases = [result.next]
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

export type ExecuteResult =
  | {
      next: Phase
    }
  | {
      subphase: Phase
    }
  | 'previous'
  | void

export type ExecuteAction = (...args: any[]) => ExecuteResult

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
          () => ({
            subphase: new TargetPhase(this.game, this.context),
          }),
          ({ investigatorId }) => {
            this.context.investigatorStates.get(investigatorId)?.addDamage(1)
            this.actionCount++
          },
        ],
      })

      actions.push({
        type: 'variable-damage',
        execute: [
          () => ({
            subphase: new TargetPhase(this.game, this.context),
          }),
          () => ({
            subphase: new DamagePhase(this.game, this.context),
          }),
          ({ investigatorId }, { damage }) => {
            this.context.investigatorStates
              .get(investigatorId)
              ?.addDamage(damage)
            this.actionCount++
          },
        ],
      })
    }

    actions.push({
      type: 'end',
      execute: () => ({
        next: new EndPhase(this.game, this.context),
      }),
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
          return 'previous'
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
          return 'previous'
        },
      },
      {
        type: 'increaseOnce',
        execute: () => {
          this.damage++
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

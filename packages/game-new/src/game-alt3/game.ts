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

    this.handleExecuteResult(result, executeContext)
  }

  private handleExecuteResult(
    result: ExecuteResult,
    executeContext: ExecuteContext
  ): void {
    switch (result.type) {
      case 'next':
        this.phases = [result.next]
        return
      case 'subphase':
        this.phases.push(result.subphase)
        executeContext.phases.push(result.subphase)
        return
      case 'endSubphase':
        if (this.phases.length < 2) {
          throw new Error(
            '"endSubphase" is not allowed on an action in the parent phase.'
          )
        }
        this.phases.pop()
        this.handleNextExecute()
        return
      default:
        return
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

  static spawnSubphase(subphase: Phase): ExecuteResultSubphase {
    return { type: 'subphase', subphase }
  }

  static endSubphase(): ExecuteResultEndSubphase {
    return { type: 'endSubphase' }
  }

  static advanceTo(next: Phase): ExecuteResultNext {
    return { type: 'next', next }
  }

  static stay(): ExecuteResultStayInCurrent {
    return { type: 'stayInCurrent' }
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

export type ExecuteResultNext = {
  type: 'next'
  next: Phase
}

export type ExecuteResultSubphase = {
  type: 'subphase'
  subphase: Phase
}

export type ExecuteResultEndSubphase = {
  type: 'endSubphase'
}

export type ExecuteResultStayInCurrent = {
  type: 'stayInCurrent'
}

export type ExecuteResult =
  | ExecuteResultNext
  | ExecuteResultSubphase
  | ExecuteResultEndSubphase
  | ExecuteResultStayInCurrent

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
          () => Game.spawnSubphase(new TargetPhase(this.game, this.context)),
          ({ investigatorId }) => {
            this.context.investigatorStates.get(investigatorId)?.addDamage(1)
            this.actionCount++
            return Game.stay()
          },
        ],
      })

      actions.push({
        type: 'variable-damage',
        execute: [
          () => Game.spawnSubphase(new TargetPhase(this.game, this.context)),
          () => Game.spawnSubphase(new DamagePhase(this.game, this.context)),
          ({ investigatorId }, { damage }) => {
            this.context.investigatorStates
              .get(investigatorId)
              ?.addDamage(damage)
            this.actionCount++
            return Game.stay()
          },
        ],
      })
    }

    actions.push({
      type: 'end',
      execute: () => Game.advanceTo(new EndPhase(this.game, this.context)),
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
          return Game.endSubphase()
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
          return Game.endSubphase()
        },
      },
      {
        type: 'increaseOnce',
        execute: () => {
          this.damage++
          return Game.stay()
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

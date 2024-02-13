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
  executes: Execute[]
}

export class Game {
  phases: Phase[]
  executeContexts: ExecuteContext[] = []

  constructor(public context: Context, phase: Phase) {
    this.phases = [phase]
  }

  get phase(): GamePhase {
    return this.convertToGamePhase(this.phases.at(-1)!)
  }

  get parentPhase(): Phase {
    return this.phases[0]
  }

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

  private convertToGameAction(action: Action): GameAction {
    return {
      type: action.type,
      execute: () => this.wrapExecute(action.execute),
    }
  }

  // Wraps the execute function to handle subphases
  private wrapExecute(execute: Execute | Execute[]): void {
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
    result: Transition,
    executeContext: ExecuteContext
  ): void {
    switch (result.type) {
      case 'next':
        this.phases[this.phases.length - 1] = result.next
        return
      case 'subphase':
        this.phases.push(result.subphase)
        executeContext.phases.push(result.subphase)
        return
      case 'parent':
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
}

export type Phase = InvestigatorPhase | EndPhase | TargetPhase | DamagePhase

export type PhaseBase = {
  type: string
  actions: Action[]
}

export type Action = {
  type: string
  execute: Execute | Execute[]
}

export type TransitionToNext = {
  type: 'next'
  next: Phase
}

export type TransitionToSubPhase = {
  type: 'subphase'
  subphase: Phase
}

export type TransitionToParent = {
  type: 'parent'
}

export type TransitionToSelf = {
  type: 'self'
}

export type Transition =
  | TransitionToNext
  | TransitionToSubPhase
  | TransitionToParent
  | TransitionToSelf

export const To = {
  subphase(subphase: Phase): TransitionToSubPhase {
    return { type: 'subphase', subphase }
  },

  parent(): TransitionToParent {
    return { type: 'parent' }
  },

  next(next: Phase): TransitionToNext {
    return { type: 'next', next }
  },

  self(): TransitionToSelf {
    return { type: 'self' }
  },
}

export type Execute = (...args: any[]) => Transition

export class InvestigatorPhase implements PhaseBase {
  type = 'investigator'
  public actionCount: number = 0

  constructor(private context: Context) {}

  get actions() {
    const actions: Action[] = []

    if (this.actionCount < 3) {
      actions.push({
        type: 'damage',
        execute: [
          () => To.subphase(new TargetPhase(this.context)),
          ({ investigatorId }) => {
            this.context.investigatorStates.get(investigatorId)?.addDamage(1)
            this.actionCount++
            return To.self()
          },
        ],
      })

      actions.push({
        type: 'variable-damage',
        execute: [
          () => To.subphase(new TargetPhase(this.context)),
          () => To.subphase(new DamagePhase(this.context)),
          ({ investigatorId }, { damage }) => {
            this.context.investigatorStates
              .get(investigatorId)
              ?.addDamage(damage)
            this.actionCount++
            return To.self()
          },
        ],
      })
    }

    actions.push({
      type: 'end',
      execute: () => To.next(new EndPhase(this.context)),
    })
    return actions
  }
}

export class TargetPhase implements PhaseBase {
  type = 'target'
  public investigatorId?: string

  constructor(private context: Context) {}

  get actions() {
    return [...this.context.investigatorStates.keys()].map(
      (investigatorId) => ({
        type: 'target',
        execute: () => {
          this.investigatorId = investigatorId
          return To.parent()
        },
      })
    )
  }
}

export class DamagePhase implements PhaseBase {
  type = 'damage'
  public damage: number = 2

  constructor(private context: Context) {}

  get actions() {
    return [
      {
        type: 'increase',
        execute: () => {
          this.damage++
          return To.parent()
        },
      },
      {
        type: 'increaseOnce',
        execute: () => {
          this.damage++
          return To.self()
        },
      },
    ]
  }
}

export class EndPhase implements PhaseBase {
  type = 'end'

  constructor(private context: Context) {}

  get actions() {
    return []
  }
}

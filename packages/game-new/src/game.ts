import { InvestigatorStates } from '@lumos/game'

export class Resolveable<T> {
  resolve!: (value: T) => void
  reject!: (reason?: any) => void
  promise = new Promise<T>((resolve, reject) => {
    this.resolve = resolve
    this.reject = reject
  })
}

export class Context {
  constructor(public investigatorStates: InvestigatorStates) {}
}

export class Game {
  context!: Context
  phases: Phase<Context>[] = []

  init(context: Context, phase: Phase<Context>): void {
    this.context = context
    this.addPhase(phase)
  }

  get phase(): Phase<Context> {
    return this.phases[this.phases.length - 1]
  }

  async invoke<TContext extends Context>(
    phase: Phase<TContext>
  ): Promise<TContext> {
    const { promise, resolve } = new Resolveable<TContext>()
    const invokedPhase = {
      ...phase,
      actions: phase.actions.map((action) => {
        return {
          ...action,
          execute: async () => {
            const result = await action.execute()
            resolve(result)
            this.phases.pop()
            return result
          },
        }
      }),
    }
    this.addPhase(invokedPhase)
    return promise
  }

  private addPhase(phase: Phase<Context>): void {
    this.phases.push(phase)
  }
}

export type Phase<TContext extends Context> = {
  type: string
  actions: Action<TContext>[]
}

export type Action<TContext extends Context> = {
  type: string
  execute: () => Promise<TContext> | TContext
}

export class InvestigatorPhase implements Phase<Context> {
  type = 'investigator'

  constructor(private game: Game, private context: Context) {}

  get actions() {
    return [
      {
        type: 'damage',
        execute: async () => {
          const { investigatorId } = await this.game.invoke(
            new TargetPhase(this.game, this.context)
          )
          this.context.investigatorStates.get(investigatorId)?.addDamage(1)
          return this.context
        },
      },
    ]
  }
}

export class TargetPhase
  implements
    Phase<
      Context & {
        investigatorId: string
      }
    >
{
  type = 'target-phase'

  constructor(private game: Game, private context: Context) {}

  get actions() {
    return [...this.context.investigatorStates.keys()].map(
      (investigatorId) => ({
        type: 'target',
        execute: () => ({
          ...this.context,
          investigatorId,
        }),
      })
    )
  }
}

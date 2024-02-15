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
  private phases: GamePhase[] = []

  constructor(public context: Context, phase: Phase) {
    this.addPhase(phase)
  }

  get phase(): GamePhase {
    return this.phases.at(-1)!
  }

  get parentPhase(): GamePhase {
    return this.phases[0]
  }

  addPhase(phase: Phase, parentGameExecute?: GameExecute) {
    const gamePhase = this.convertToGamePhase(phase, parentGameExecute)
    this.phases.push(gamePhase)
  }

  popCurrentPhase() {
    this.phases.pop()
  }

  setCurrentPhase(phase: Phase) {
    const gamePhase = this.convertToGamePhase(phase)
    this.phases[this.phases.length - 1] = gamePhase
  }

  private convertToGamePhase(
    phase: Phase,
    parentGameExecute?: GameExecute
  ): GamePhase {
    // Create a Proxy that intercepts the `actions` property access
    const phaseProxy = new Proxy(phase, {
      get: (target, prop) => {
        if (prop === 'actions') {
          // Convert actions to GameAction objects on-the-fly
          return target[prop].map((action) =>
            this.convertToGameAction(action, parentGameExecute)
          )
        }
        return target[prop as keyof Phase]
      },
    })

    return phaseProxy as GamePhase
  }

  private convertToGameAction(
    action: Action,
    parentGameExecute?: GameExecute
  ): GameAction {
    return {
      type: action.type,
      execute: () =>
        action.execute(new GameExecute(this, [], parentGameExecute)),
    }
  }
}

type Phase =
  | InvestigatorPhase
  | EndPhase
  | TargetPhase
  | DamagePhase
  | TargetAndDamagePhase

type PhaseBase<TPhaseResult extends PhaseResult = PhaseResult> = {
  type: string
  actions: Action<TPhaseResult>[]
}

type GetPhaseResult<TPhase extends Phase> = TPhase extends PhaseBase<
  infer TResult
>
  ? TResult
  : never

type Action<TPhaseResult extends PhaseResult = PhaseResult> = {
  type: string
  execute: Execute<TPhaseResult>
}

type PhaseResult = Record<string, unknown> | undefined

type Execute<TPhaseResult extends PhaseResult = PhaseResult> = (
  e: GameExecute<[], TPhaseResult>
) => void

class PendingPhaseResult<TPhaseResult extends PhaseResult = PhaseResult> {
  result?: TPhaseResult

  resolve(result: TPhaseResult) {
    this.result = result
  }
}

type UnwrapPendingPhaseResult<
  TPendingPhaseResults extends PendingPhaseResult[]
> = TPendingPhaseResults extends [
  PendingPhaseResult<infer TPhaseResult>,
  ...infer TRest extends PendingPhaseResult[]
]
  ? [TPhaseResult, ...UnwrapPendingPhaseResult<TRest>]
  : []

class GameExecute<
  TPendingPhaseResults extends PendingPhaseResult[] = PendingPhaseResult[],
  TPhaseResult extends PhaseResult = PhaseResult
> {
  private executeQueue: (() => void)[] = []

  constructor(
    private game: Game,
    private pendingPhaseResults: TPendingPhaseResults,
    private parentGameExecute?: GameExecute
  ) {}

  private enqueueOrExecute(fn: () => void) {
    if (this.pendingPhaseResults.length > 0) {
      this.executeQueue.push(fn)
      return
    }
    fn()
  }

  private resume() {
    while (this.executeQueue.length > 0) {
      const fn = this.executeQueue.shift()!
      fn()
    }
  }

  private get unwrappedPendingPhaseResults() {
    return this.pendingPhaseResults
      .map((p) => p.result)
      .filter(
        (r) => r !== undefined
      ) as UnwrapPendingPhaseResult<TPendingPhaseResults>
  }

  apply(
    applyFn: (results: UnwrapPendingPhaseResult<TPendingPhaseResults>) => void
  ): this {
    this.enqueueOrExecute(() => applyFn(this.unwrappedPendingPhaseResults))
    return this
  }

  applyToParent(
    applyFn: (
      results: UnwrapPendingPhaseResult<TPendingPhaseResults>
    ) => TPhaseResult
  ): void {
    if (this.parentGameExecute === undefined) {
      throw new Error('No parent to apply to')
    }
    const awaitedPhaseResult = this.parentGameExecute.pendingPhaseResults.at(-1)

    this.enqueueOrExecute(() => {
      const result = applyFn(this.unwrappedPendingPhaseResults)
      this.game.popCurrentPhase()
      awaitedPhaseResult?.resolve(result)
      this.parentGameExecute?.resume()
    })
  }

  toNext(next: Phase) {
    this.enqueueOrExecute(() => this.game.setCurrentPhase(next))
  }

  waitFor<TPhase extends Phase>(phase: TPhase) {
    const pendingPhaseResult: PendingPhaseResult<GetPhaseResult<TPhase>> =
      new PendingPhaseResult<GetPhaseResult<TPhase>>()
    const parentExecute: GameExecute<
      [...TPendingPhaseResults, PendingPhaseResult<GetPhaseResult<TPhase>>],
      GetPhaseResult<TPhase>
    > = new GameExecute(
      this.game,
      [...this.pendingPhaseResults, pendingPhaseResult],
      this.parentGameExecute
    )
    this.enqueueOrExecute(() => this.game.addPhase(phase, parentExecute))
    return parentExecute
  }
}

export class InvestigatorPhase implements PhaseBase {
  type = 'investigator'
  public actionCount: number = 0

  constructor(private context: Context) {}

  get actions() {
    const actions: Action[] = []

    if (this.actionCount < 3) {
      actions.push({
        type: 'damage',
        execute: (e) =>
          e
            .waitFor(new TargetPhase(this.context))
            .apply(([{ investigatorId }]) => {
              this.context.investigatorStates.get(investigatorId!)?.addDamage(1)
              this.actionCount++
            }),
      })

      actions.push({
        type: 'variable-damage',
        execute: (e) =>
          e
            .waitFor(new TargetPhase(this.context))
            .waitFor(new DamagePhase(this.context))
            .apply(([{ investigatorId }, { damage }]) => {
              this.context.investigatorStates
                .get(investigatorId!)
                ?.addDamage(damage)
              this.actionCount++
            }),
      })

      actions.push({
        type: 'variable-damage-subphase',
        execute: (e) =>
          e
            .waitFor(new TargetAndDamagePhase(this.context))
            .apply(([{ investigatorId, damage }]) => {
              this.context.investigatorStates
                .get(investigatorId!)
                ?.addDamage(damage)
              this.actionCount++
            }),
      })
    }

    actions.push({
      type: 'end',
      execute: (e) => e.toNext(new EndPhase(this.context)),
    })
    return actions
  }
}

type TargetPhaseResult = {
  investigatorId: string
}

export class TargetPhase implements PhaseBase<TargetPhaseResult> {
  type = 'target'

  constructor(private context: Context) {}

  get actions() {
    return [...this.context.investigatorStates.keys()].map<
      Action<TargetPhaseResult>
    >((investigatorId) => ({
      type: 'target',
      execute: (e) =>
        e.applyToParent(() => ({
          investigatorId,
        })),
    }))
  }
}

type DamagePhaseResult = {
  damage: number
}

export class DamagePhase implements PhaseBase<DamagePhaseResult> {
  type = 'damage'
  public damage: number = 2

  constructor(private context: Context) {}

  get actions() {
    return [
      {
        type: 'increase',
        execute: (e) =>
          e
            .apply(() => {
              this.damage++
            })
            .applyToParent(() => ({
              damage: this.damage,
            })),
      },
      {
        type: 'increaseOnce',
        execute: (e) =>
          e.apply(() => {
            this.damage++
          }),
      },
    ] satisfies Action<DamagePhaseResult>[]
  }
}

type TargetAndDamagePhaseResult = {
  investigatorId: string
  damage: number
}

export class TargetAndDamagePhase
  implements PhaseBase<TargetAndDamagePhaseResult>
{
  type = 'targetAndDamage'

  constructor(private context: Context) {}

  get actions() {
    return [
      {
        type: 'targetAndDamage',
        execute: (e) =>
          e
            .waitFor(new TargetPhase(this.context))
            .waitFor(new DamagePhase(this.context))
            .applyToParent(([{ investigatorId }, { damage }]) => ({
              investigatorId,
              damage,
            })),
      },
    ] satisfies Action<TargetAndDamagePhaseResult>[]
  }
}

export class EndPhase implements PhaseBase {
  type = 'end'

  constructor(private context: Context) {}

  get actions() {
    return []
  }
}
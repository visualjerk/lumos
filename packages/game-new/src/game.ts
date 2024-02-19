import { Context } from '@lumos/game'
import { Phase, PhaseResult, GetPhaseResult, PhaseAction } from './phase'

export type GamePhase = {
  type: string
  actions: GameAction[]
}

export type GameAction = Omit<PhaseAction, 'execute'> & {
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
    action: PhaseAction,
    parentGameExecute?: GameExecute
  ): GameAction {
    return {
      ...action,
      execute: () =>
        action.execute(new GameExecute(this, [], [], parentGameExecute)),
    }
  }
}

export class PendingPhaseResult<
  TPhaseResult extends PhaseResult = PhaseResult
> {
  result?: TPhaseResult

  resolve(result: TPhaseResult) {
    this.result = result
  }
}

export type UnwrapPendingPhaseResult<
  TPendingPhaseResults extends PendingPhaseResult[]
> = TPendingPhaseResults extends [
  PendingPhaseResult<infer TPhaseResult>,
  ...infer TRest extends PendingPhaseResult[]
]
  ? [TPhaseResult, ...UnwrapPendingPhaseResult<TRest>]
  : []

export class GameExecute<
  TPendingPhaseResults extends PendingPhaseResult[] = PendingPhaseResult[],
  TPhaseResult extends PhaseResult = PhaseResult,
  TResolvedPhaseResults extends PendingPhaseResult[] = PendingPhaseResult[]
> {
  private executeQueue: (() => void)[] = []

  constructor(
    private game: Game,
    private pendingPhaseResults: TPendingPhaseResults,
    private resolvedPhaseResults: TResolvedPhaseResults,
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
    return [...this.pendingPhaseResults, ...this.resolvedPhaseResults]
      .map((p) => p.result)
      .filter((r) => r !== undefined) as UnwrapPendingPhaseResult<
      [...TPendingPhaseResults, ...TResolvedPhaseResults]
    >
  }

  apply(
    applyFn: (
      results: UnwrapPendingPhaseResult<
        [...TPendingPhaseResults, ...TResolvedPhaseResults]
      >
    ) => void
  ): this {
    this.enqueueOrExecute(() => applyFn(this.unwrappedPendingPhaseResults))
    return this
  }

  applyToParent(
    applyFn: (
      results: UnwrapPendingPhaseResult<
        [...TPendingPhaseResults, ...TResolvedPhaseResults]
      >
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

  toParent() {
    if (this.parentGameExecute === undefined) {
      throw new Error('No parent to apply to')
    }

    this.enqueueOrExecute(() => {
      this.game.popCurrentPhase()
      this.parentGameExecute?.resume()
    })
  }

  toNext(next: Phase) {
    this.enqueueOrExecute(() => this.game.setCurrentPhase(next))
  }

  waitFor<TPhase extends Phase>(
    phase:
      | TPhase
      | ((
          results: UnwrapPendingPhaseResult<
            [...TPendingPhaseResults, ...TResolvedPhaseResults]
          >
        ) => TPhase)
  ) {
    const pendingPhaseResult: PendingPhaseResult<GetPhaseResult<TPhase>> =
      new PendingPhaseResult<GetPhaseResult<TPhase>>()
    const parentExecute: GameExecute<
      [...TPendingPhaseResults, PendingPhaseResult<GetPhaseResult<TPhase>>],
      GetPhaseResult<TPhase>,
      TResolvedPhaseResults
    > = new GameExecute(
      this.game,
      [...this.pendingPhaseResults, pendingPhaseResult],
      this.resolvedPhaseResults,
      this.parentGameExecute
    )
    this.enqueueOrExecute(() => {
      const resolvedPhase =
        typeof phase === 'function'
          ? phase(this.unwrappedPendingPhaseResults)
          : phase
      this.game.addPhase(resolvedPhase, parentExecute)
    })
    return parentExecute
  }

  addResult<TPhaseResult extends PhaseResult>(result: TPhaseResult) {
    const phaseResult: PendingPhaseResult<TPhaseResult> =
      new PendingPhaseResult<TPhaseResult>()
    phaseResult.resolve(result)

    const gameExecute: GameExecute<
      TPendingPhaseResults,
      TPhaseResult,
      [...TResolvedPhaseResults, PendingPhaseResult<TPhaseResult>]
    > = new GameExecute(
      this.game,
      this.pendingPhaseResults,
      [...this.resolvedPhaseResults, phaseResult],
      this.parentGameExecute
    )

    return gameExecute
  }
}

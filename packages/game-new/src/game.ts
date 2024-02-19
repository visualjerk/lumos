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

  addPhase(phase: Phase, awaitedPhaseResult?: PendingPhaseResult) {
    const gamePhase = this.convertToGamePhase(phase, awaitedPhaseResult)
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
    awaitedPhaseResult?: PendingPhaseResult
  ): GamePhase {
    // Create a Proxy that intercepts the `actions` property access
    const phaseProxy = new Proxy(phase, {
      get: (target, prop) => {
        if (prop === 'actions') {
          // Convert actions to GameAction objects on-the-fly
          return target[prop].map((action) =>
            this.convertToGameAction(action, awaitedPhaseResult)
          )
        }
        return target[prop as keyof Phase]
      },
    })

    return phaseProxy as GamePhase
  }

  private convertToGameAction(
    action: PhaseAction,
    awaitedPhaseResult?: PendingPhaseResult
  ): GameAction {
    return {
      ...action,
      execute: () =>
        action.execute(new GameExecute(this, [], awaitedPhaseResult)),
    }
  }
}

type PendingPhaseResultSubscription = {
  unsubscribe: () => void
}

export class PendingPhaseResult<
  TPhaseResult extends PhaseResult = PhaseResult
> {
  result?: TPhaseResult
  isResolved: boolean = false
  subscribers: (() => void)[] = []

  resolve(result: TPhaseResult) {
    this.result = result
    this.isResolved = true
    this.notifySubscribers()
  }

  notifySubscribers() {
    this.subscribers.forEach((s) => s())
  }

  onResolve(subscriber: () => void): PendingPhaseResultSubscription {
    this.subscribers.push(subscriber)
    return {
      unsubscribe: () => this.unsubscribe(subscriber),
    }
  }

  private unsubscribe(subscriber: () => void) {
    const index = this.subscribers.indexOf(subscriber)
    if (index !== -1) {
      this.subscribers.splice(index, 1)
    }
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
  TPhaseResult extends PhaseResult = PhaseResult
> {
  private executeQueue: (() => void)[] = []
  private subscriptions: PendingPhaseResultSubscription[] = []

  constructor(
    private game: Game,
    private pendingPhaseResults: TPendingPhaseResults,
    private awaitedPhaseResult?: PendingPhaseResult
  ) {
    this.subscribeToPendingPhaseResults()
  }

  private get hasUnresolvedResults() {
    return this.pendingPhaseResults.some((p) => !p.isResolved)
  }

  private enqueueOrExecute(fn: () => void) {
    if (this.hasUnresolvedResults) {
      this.executeQueue.push(fn)
      return
    }
    fn()
  }

  private subscribeToPendingPhaseResults() {
    this.pendingPhaseResults.forEach((p) => {
      this.subscriptions.push(
        p.onResolve(() => this.resumeIfNoUnresolvedResults())
      )
    })
  }

  private unsubscribeFromPendingPhaseResults() {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }

  private resumeIfNoUnresolvedResults() {
    if (!this.hasUnresolvedResults) {
      this.resume()
      this.unsubscribeFromPendingPhaseResults()
    }
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
    if (this.awaitedPhaseResult === undefined) {
      throw new Error('No parent to apply to')
    }

    this.enqueueOrExecute(() => {
      const result = applyFn(this.unwrappedPendingPhaseResults)
      this.game.popCurrentPhase()
      this.awaitedPhaseResult?.resolve(result)
    })
  }

  toParent() {
    if (this.awaitedPhaseResult === undefined) {
      throw new Error('No parent to apply to')
    }

    this.enqueueOrExecute(() => {
      this.game.popCurrentPhase()
      this.awaitedPhaseResult?.resolve(undefined as any)
    })
  }

  toNext(next: Phase) {
    this.enqueueOrExecute(() => this.game.setCurrentPhase(next))
  }

  waitFor<TPhase extends Phase>(
    phase:
      | TPhase
      | ((results: UnwrapPendingPhaseResult<TPendingPhaseResults>) => TPhase)
  ) {
    const pendingPhaseResult: PendingPhaseResult<GetPhaseResult<TPhase>> =
      new PendingPhaseResult<GetPhaseResult<TPhase>>()
    const parentExecute: GameExecute<
      [...TPendingPhaseResults, PendingPhaseResult<GetPhaseResult<TPhase>>],
      GetPhaseResult<TPhase>
    > = new GameExecute(
      this.game,
      [...this.pendingPhaseResults, pendingPhaseResult],
      this.awaitedPhaseResult
    )
    this.enqueueOrExecute(() => {
      const resolvedPhase =
        typeof phase === 'function'
          ? phase(this.unwrappedPendingPhaseResults)
          : phase
      this.game.addPhase(resolvedPhase, pendingPhaseResult)
    })
    return parentExecute
  }

  addResult<TPhaseResult extends PhaseResult>(result: TPhaseResult) {
    const phaseResult: PendingPhaseResult<TPhaseResult> =
      new PendingPhaseResult<TPhaseResult>()
    phaseResult.resolve(result)

    const gameExecute: GameExecute<
      [...TPendingPhaseResults, PendingPhaseResult<TPhaseResult>],
      TPhaseResult
    > = new GameExecute(
      this.game,
      [...this.pendingPhaseResults, phaseResult],
      this.awaitedPhaseResult
    )

    return gameExecute
  }
}

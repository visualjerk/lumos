import { Context } from './context'
import { Phase, PhaseResult, GetPhaseResult, PhaseAction } from './phase'

export type GamePhase = {
  type: string
  onEnter?: (coordinator: GamePhaseCoordinator) => void
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

    if (gamePhase.onEnter !== undefined) {
      gamePhase.onEnter(new GamePhaseCoordinator(this, [], awaitedPhaseResult))
    }
  }

  setCurrentPhase(phase: Phase) {
    const gamePhase = this.convertToGamePhase(phase)
    this.phases[this.phases.length - 1] = gamePhase

    if (gamePhase.onEnter !== undefined) {
      gamePhase.onEnter(new GamePhaseCoordinator(this, []))
    }
  }

  popCurrentPhase() {
    this.phases.pop()
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
        action.execute(new GamePhaseCoordinator(this, [], awaitedPhaseResult)),
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

export class GamePhaseCoordinator<
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

  toNext(
    phase:
      | Phase
      | ((results: UnwrapPendingPhaseResult<TPendingPhaseResults>) => Phase)
  ) {
    this.enqueueOrExecute(() => {
      const resolvedPhase =
        typeof phase === 'function'
          ? phase(this.unwrappedPendingPhaseResults)
          : phase
      this.game.setCurrentPhase(resolvedPhase)
    })
  }

  waitFor<TPhase extends Phase>(
    phase:
      | TPhase
      | ((results: UnwrapPendingPhaseResult<TPendingPhaseResults>) => TPhase)
  ) {
    const pendingPhaseResult: PendingPhaseResult<GetPhaseResult<TPhase>> =
      new PendingPhaseResult<GetPhaseResult<TPhase>>()

    this.enqueueOrExecute(() => {
      const resolvedPhase =
        typeof phase === 'function'
          ? phase(this.unwrappedPendingPhaseResults)
          : phase
      this.game.addPhase(resolvedPhase, pendingPhaseResult)
    })

    const coordinator: GamePhaseCoordinator<
      [...TPendingPhaseResults, PendingPhaseResult<GetPhaseResult<TPhase>>],
      TPhaseResult
    > = new GamePhaseCoordinator(
      this.game,
      [...this.pendingPhaseResults, pendingPhaseResult],
      this.awaitedPhaseResult
    )

    return coordinator
  }

  waitForAll(
    phases:
      | Phase[]
      | ((results: UnwrapPendingPhaseResult<TPendingPhaseResults>) => Phase[])
  ) {
    // TODO: check if this is correct
    const resolvedPhases =
      typeof phases === 'function'
        ? phases(this.unwrappedPendingPhaseResults)
        : phases

    let newCoordinator: GamePhaseCoordinator = this
    resolvedPhases.forEach((phase) => {
      newCoordinator = newCoordinator.waitFor(phase)
    })
    return newCoordinator
  }
}

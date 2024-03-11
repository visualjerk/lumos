import { Context, createInitialContext } from './context'
import { Investigator, createInvestigatorPhase } from './investigator'
import { Phase, PhaseResult, GetPhaseResult, PhaseAction } from './phase'
import { Scenario } from './scenario'
import { createSeed, setRngSeed } from './utils'

export function createInitialGame(
  scenario: Scenario,
  investigators: Investigator[],
  history: GameHistory = [],
  seed: number = createSeed()
) {
  setRngSeed(seed)
  const context = createInitialContext(scenario, investigators)
  const phase = createInvestigatorPhase(context)
  return new Game(context, phase, history, seed)
}

export type GamePhase = {
  type: string
  onEnter?: (coordinator: GamePhaseCoordinator) => void
  actions: GameAction[]
}

export type GameAction = Omit<PhaseAction, 'execute'> & {
  execute: () => void
}

export type GameHistory = number[]

export class Game {
  private phases: GamePhase[] = []
  private history: GameHistory = []

  constructor(
    public context: Context,
    phase: Phase,
    initialHistory: GameHistory,
    public seed: number
  ) {
    this.addPhase(phase)
    this.applyHistory(initialHistory)
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
          return target.actions.map((action, index) => ({
            ...action,
            execute: () => {
              this.history.push(index)
              action.execute(
                new GamePhaseCoordinator(this, [], awaitedPhaseResult)
              )
            },
          }))
        }
        return target[prop as keyof Phase]
      },
    })

    return phaseProxy as GamePhase
  }

  undo() {
    return this.resetToHistory(this.history.slice(0, -1))
  }

  get canUndo() {
    return this.history.length > 0
  }

  private applyHistory(initialHistory: GameHistory) {
    initialHistory.forEach((index) => this.phase.actions[index].execute())
  }

  private resetToHistory(newHistory: GameHistory) {
    return createInitialGame(
      this.context.scenario,
      this.context.investigators,
      newHistory,
      this.seed
    )
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
    const pendingPhaseResults: PendingPhaseResult[] = []

    this.enqueueOrExecute(() => {
      const resolvedPhases =
        typeof phases === 'function'
          ? phases(this.unwrappedPendingPhaseResults)
          : phases

      resolvedPhases.forEach((phase) => {
        const pendingPhaseResult = new PendingPhaseResult()
        pendingPhaseResults.push(pendingPhaseResult)
        this.game.addPhase(phase, pendingPhaseResult)
      })
    })

    const coordinator = new GamePhaseCoordinator(
      this.game,
      [...this.pendingPhaseResults, ...pendingPhaseResults],
      this.awaitedPhaseResult
    )

    return coordinator
  }
}

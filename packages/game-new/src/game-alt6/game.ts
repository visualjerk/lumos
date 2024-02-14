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

type PhaseBase = {
  type: string
  actions: Action[]
}

type Action = {
  type: string
  execute: Execute
}

class GameExecute<TSubPhases extends Phase[] = Phase[]> {
  private executeQueue: (() => void)[] = []

  constructor(
    private game: Game,
    private subPhases: TSubPhases,
    private parentGameExecute?: GameExecute
  ) {}

  private get waitForSubPhase() {
    return this.subPhases.length > 0
  }

  private enqueueOrExecute(fn: () => void) {
    if (this.waitForSubPhase) {
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

  apply(applyFn: (subPhases: TSubPhases) => void): GameExecute<TSubPhases> {
    this.enqueueOrExecute(() => applyFn(this.subPhases))
    return this
  }

  toNext(next: Phase): GameExecute<TSubPhases> {
    this.enqueueOrExecute(() => this.game.setCurrentPhase(next))
    return this
  }

  toParent(): GameExecute<TSubPhases> {
    this.enqueueOrExecute(() => {
      this.game.popCurrentPhase()
      this.parentGameExecute?.resume()
    })
    return this
  }

  waitFor<TPhase extends Phase>(
    phase: TPhase
  ): GameExecute<[...TSubPhases, TPhase]> {
    const parentExecute = new GameExecute(
      this.game,
      [...this.subPhases, phase],
      this.parentGameExecute
    )
    this.enqueueOrExecute(() => this.game.addPhase(phase, parentExecute))
    return parentExecute as GameExecute<[...TSubPhases, TPhase]>
  }
}

type Execute = (e: GameExecute<[]>) => void

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

export class TargetPhase implements PhaseBase {
  type = 'target'
  public investigatorId?: string

  constructor(private context: Context) {}

  get actions() {
    return [...this.context.investigatorStates.keys()].map<Action>(
      (investigatorId) => ({
        type: 'target',
        execute: (e) =>
          e
            .apply(() => {
              this.investigatorId = investigatorId
            })
            .toParent(),
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
        execute: (e) =>
          e
            .apply(() => {
              this.damage++
            })
            .toParent(),
      },
      {
        type: 'increaseOnce',
        execute: (e) =>
          e.apply(() => {
            this.damage++
          }),
      },
    ] satisfies Action[]
  }
}

export class TargetAndDamagePhase implements PhaseBase {
  type = 'targetAndDamage'
  public investigatorId?: string
  public damage: number = 0

  constructor(private context: Context) {}

  get actions() {
    return [
      {
        type: 'targetAndDamage',
        execute: (e) =>
          e
            .waitFor(new TargetPhase(this.context))
            .waitFor(new DamagePhase(this.context))
            .apply(([{ investigatorId }, { damage }]) => {
              this.investigatorId = investigatorId
              this.damage = damage
            })
            .toParent(),
      },
    ] satisfies Action[]
  }
}

export class EndPhase implements PhaseBase {
  type = 'end'

  constructor(private context: Context) {}

  get actions() {
    return []
  }
}

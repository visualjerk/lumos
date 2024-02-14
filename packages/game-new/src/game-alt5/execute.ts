import { InvestigatorStates } from '@lumos/game'

export class Context {
  constructor(public investigatorStates: InvestigatorStates) {}
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

export type TransitionToSubPhase<TPhase extends Phase = Phase> = {
  type: 'subphase'
  subphase: TPhase
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

type TransitionResult<T extends Transition> = T extends TransitionToSubPhase
  ? [T['subphase']]
  : []

export const to = {
  subphase<TPhase extends Phase>(
    subphase: TPhase
  ): TransitionToSubPhase<TPhase> {
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

export type Execute<
  TTransition extends Transition = Transition,
  Targs extends Phase[] = []
> = (...args: Targs) => TTransition

type UnpackExecutes<T, TPhases extends Phase[] = []> = T extends [
  infer Head extends Execute,
  ...infer Rest
]
  ? [
      Execute<Transition, TPhases>,
      ...UnpackExecutes<
        Rest,
        [...TPhases, ...TransitionResult<ReturnType<Head>>]
      >
    ]
  : []

function executeSequence<T extends Execute[]>(
  ...executes: UnpackExecutes<T>
): UnpackExecutes<T> {
  return executes
}

type UnpackExecutes2<
  T extends Execute,
  TPhases extends Phase[] = []
> = T extends [infer Head extends Execute, ...infer Rest]
  ? [
      Execute<Transition, TPhases>,
      ...UnpackExecutes<
        Rest,
        [...TPhases, ...TransitionResult<ReturnType<Head>>]
      >
    ]
  : []

function executeSequence2<
  TFirst extends Execute,
  TRest extends Execute<Transition, TransitionResult<ReturnType<TFirst>>>[]
>(first: TFirst, ...rest: TRest) {
  if (rest.length === 0) {
    return [first]
  }
  return [first, ...executeSequence2(...rest)]
}

executeSequence2(
  () => to.subphase(new TargetPhase(this.context)),
  ({ investigatorId }) => {
    this.context.investigatorStates.get(investigatorId)?.addDamage(1)
    this.actionCount++
    return to.self()
  }
)

executeSequence2(
  () => to.subphase(new TargetPhase(this.context)),
  () => to.subphase(new DamagePhase(this.context)),
  ({ investigatorId }) => {
    this.context.investigatorStates.get(investigatorId)?.addDamage(1)
    this.actionCount++
    return to.self()
  }
)

export class InvestigatorPhase implements PhaseBase {
  type = 'investigator'
  public actionCount: number = 0

  constructor(private context: Context) {}

  get actions() {
    const actions: Action[] = []

    actions.push({
      type: 'end',
      execute: () => to.next(new EndPhase(this.context)),
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
          return to.parent()
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
          return to.parent()
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

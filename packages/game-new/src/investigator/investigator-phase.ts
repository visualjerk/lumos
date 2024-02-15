import { Context } from '@lumos/game'
import { PhaseBase, Action } from '../phase'
import { TargetPhase } from '../target'

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
    }

    actions.push({
      type: 'end',
      execute: (e) => e.toNext(new EndPhase(this.context)),
    })
    return actions
  }
}

export class EndPhase implements PhaseBase {
  type = 'end'

  constructor(private context: Context) {}

  get actions() {
    return []
  }
}

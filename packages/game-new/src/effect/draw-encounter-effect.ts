import { InvestigatorTarget, createInvestigatorTargetPhase } from '../target'
import { CreateEffect, createEffectPhase } from './effect'
import { GamePhaseCoordinator } from '../game'
import { PhaseAction, PhaseBase, PhaseResult } from '../phase'
import { Context } from '../context'
import { InvestigatorId } from '../investigator'
import { getEncounterCard, EncounterCard } from '../encounter'

export type DrawEncounterEffect = CreateEffect<'drawEncounter'> & {
  target: InvestigatorTarget
}

export function createDrawEncounterEffectPhase(
  context: Context,
  investigatorId: InvestigatorId,
  effect: DrawEncounterEffect
): DrawEncounterEffectPhase {
  return new DrawEncounterEffectPhase(context, investigatorId, effect)
}

export class DrawEncounterEffectPhase implements PhaseBase {
  type = 'drawEncounter'

  private encounterCard: EncounterCard | null = null
  private targetInvestigatorId: InvestigatorId | null = null

  constructor(
    public context: Context,
    public investigatorId: InvestigatorId,
    public effect: DrawEncounterEffect
  ) {}

  onEnter(coordinator: GamePhaseCoordinator<[], PhaseResult>) {
    coordinator
      .waitFor(
        createInvestigatorTargetPhase(
          this.context,
          this.investigatorId,
          this.effect.target
        )
      )
      .apply(([{ investigatorId }]) => {
        this.targetInvestigatorId = investigatorId
        const encounterCardId = this.context.encounterState.draw()
        this.encounterCard = getEncounterCard(encounterCardId)
      })
  }

  get actions() {
    const actions: PhaseAction[] = [
      {
        type: 'confirm',
        investigatorId: this.investigatorId,
        execute: (coordinator) =>
          coordinator
            .waitFor(
              createEffectPhase(
                this.context,
                this.targetInvestigatorId!,
                this.encounterCard!.effect
              )
            )
            .apply(() => {
              this.context.encounterState.discard(this.encounterCard!.id)
            })
            .toParent(),
      },
    ]
    return actions
  }
}

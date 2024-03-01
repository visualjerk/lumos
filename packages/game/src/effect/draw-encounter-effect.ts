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
  type = 'drawEncounterEffect' as const

  public encounterCard: EncounterCard | null = null
  public targetInvestigatorId: InvestigatorId | null = null

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
    const actions: PhaseAction[] = []

    const investigatorId = this.investigatorId
    const targetInvestigatorId = this.targetInvestigatorId!
    const encounterCard = this.encounterCard!

    if (encounterCard.type === 'trap') {
      actions.push({
        type: 'confirm',
        investigatorId,
        execute: (coordinator) =>
          coordinator
            .waitFor(
              createEffectPhase(
                this.context,
                targetInvestigatorId,
                encounterCard.effect
              )
            )
            .apply(() => {
              this.context.encounterState.discard(encounterCard.id)
            })
            .toParent(),
      })
    }

    if (encounterCard.type === 'enemy') {
      actions.push({
        type: 'confirm',
        investigatorId,
        execute: (coordinator) =>
          coordinator
            .apply(() => {
              const investigatorState =
                this.context.getInvestigatorState(targetInvestigatorId)

              this.context.enemyStates.add(
                encounterCard,
                investigatorState.currentLocation,
                targetInvestigatorId
              )
            })
            .toParent(),
      })
    }

    return actions
  }
}

import { PhaseBase, PhaseAction } from '../phase'
import { createEffectPhase } from '../effect'
import { Context } from '../context'
import { InvestigatorId } from './investigator'
import { InvestigatorState } from './investigator-state'
import { isConnected } from '../location'
import { createScenePhase } from '../scene'
import { createEnemyPhase } from '../enemy'

export function createInvestigatorPhase(context: Context) {
  return new InvestigatorPhase(context)
}

export const INVESTIGATOR_ACTIONS_PER_TURN = 3

export class InvestigatorPhase implements PhaseBase {
  type = 'investigator'
  actionsMade: number = 0
  investigatorId: InvestigatorId

  constructor(public context: Context) {
    // TODO: support multiple investigators
    this.investigatorId = context.investigators[0].id
  }

  get actions() {
    const actions: PhaseAction[] = []

    actions.push({
      type: 'end',
      execute: (coordinator) =>
        coordinator.toNext(createEnemyPhase(this.context)),
    })

    if (this.actionsMade >= INVESTIGATOR_ACTIONS_PER_TURN) {
      return actions
    }

    actions.push(...this.generalActions)
    actions.push(...this.locationActions)
    actions.push(...this.cardsInHandActions)

    return actions
  }

  private get investigatorState(): InvestigatorState {
    return this.context.getInvestigatorState(this.investigatorId)
  }

  private get generalActions(): PhaseAction[] {
    const actions: PhaseAction[] = []

    if (this.investigatorState.canDraw()) {
      actions.push({
        type: 'draw',
        investigatorId: this.investigatorId,
        execute: (coordinator) =>
          coordinator
            .waitFor(
              createEffectPhase(this.context, this.investigatorId, {
                type: 'enemyOpportunityAttack',
                target: 'self',
              })
            )
            .waitFor(
              createEffectPhase(this.context, this.investigatorId, {
                type: 'draw',
                amount: 1,
                target: 'self',
              })
            )
            .apply(() => {
              this.actionsMade++
            }),
      })
    }

    if (
      this.context.sceneState.satisfiesThreshold(
        this.context.totalInvestigatorClues
      )
    ) {
      actions.push({
        type: 'solveScene',
        execute: (coordinator) =>
          coordinator.waitFor(createScenePhase(this.context)),
      })
    }

    return actions
  }

  private get locationActions(): PhaseAction[] {
    const actions: PhaseAction[] = []

    const currentLocation = this.context.getLocation(
      this.investigatorState.currentLocation
    )

    const connectedLocations = this.context.scenario.locationCards.filter(
      ({ id }) => {
        const location = this.context.getLocation(id)
        return isConnected(currentLocation, location)
      }
    )

    connectedLocations.forEach((location) => {
      actions.push({
        type: 'move',
        locationId: location.id,
        execute: (coordinator) =>
          coordinator
            .waitFor(
              createEffectPhase(this.context, this.investigatorId, {
                type: 'enemyOpportunityAttack',
                target: 'self',
              })
            )
            .apply(() => {
              this.context.moveInvestigator(this.investigatorId, location.id)
              this.actionsMade++
            }),
      })
    })

    if (this.context.locationStates.get(currentLocation.id)!.clues > 0) {
      actions.push({
        type: 'investigate',
        execute: (coordinator) =>
          coordinator
            .waitFor(
              createEffectPhase(this.context, this.investigatorId, {
                type: 'enemyOpportunityAttack',
                target: 'self',
              })
            )
            .waitFor(
              createEffectPhase(this.context, this.investigatorId, {
                type: 'investigate',
                clueAmount: 1,
                locationTarget: 'current',
                investigatorTarget: 'self',
              })
            )
            .apply(() => {
              this.actionsMade++
            }),
      })
    }

    return actions
  }

  private get cardsInHandActions(): PhaseAction[] {
    const actions: PhaseAction[] = []

    this.investigatorState.cardsInHand.forEach((cardId, index) => {
      const card = this.context.getInvestigatorCard(cardId)

      if (card.type !== 'action') {
        return
      }

      actions.push({
        type: 'play',
        cardIndex: index,
        execute: (coordinator) =>
          coordinator
            .waitFor(
              createEffectPhase(this.context, this.investigatorId, {
                type: 'enemyOpportunityAttack',
                target: 'self',
              })
            )
            .waitFor(
              createEffectPhase(this.context, this.investigatorId, card.effect)
            )
            .apply(() => {
              this.investigatorState.discard(index)
              this.actionsMade++
            }),
      })
    })

    return actions
  }
}

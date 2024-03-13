import { PhaseBase, PhaseAction } from '../phase'
import {
  canUseEffect,
  createEffectPhase,
  provokesOpportunityAttack,
} from '../effect'
import { Context } from '../context'
import { InvestigatorId } from './investigator'
import { InvestigatorState } from './investigator-state'
import { isConnected } from '../location'
import { createScenePhase } from '../scene'
import { createEnemyPhase } from '../enemy'

export function createInvestigatorPhase(
  context: Context,
  controllerId: InvestigatorId = context.investigators[0].id
) {
  return new InvestigatorPhase(context, controllerId)
}

export const INVESTIGATOR_ACTIONS_PER_TURN = 3

export class InvestigatorPhase implements PhaseBase {
  type = 'investigator' as const
  actionsMade: number = 0

  constructor(public context: Context, public controllerId: InvestigatorId) {}

  get actions() {
    const actions: PhaseAction[] = []

    actions.push({
      type: 'end',
      controllerId: this.controllerId,
      execute: (coordinator) =>
        coordinator.toNext(() => {
          const { investigators } = this.context
          const index = investigators.findIndex(
            ({ id }) => id === this.controllerId
          )

          if (index === investigators.length - 1) {
            return createEnemyPhase(this.context)
          }

          return createInvestigatorPhase(
            this.context,
            investigators[index + 1].id
          )
        }),
    })

    if (this.actionsMade >= INVESTIGATOR_ACTIONS_PER_TURN) {
      return actions
    }

    actions.push(...this.generalActions)
    actions.push(...this.locationActions)
    actions.push(...this.cardsInHandActions)
    actions.push(...this.enemyActions)

    return actions
  }

  private get investigatorState(): InvestigatorState {
    return this.context.getInvestigatorState(this.controllerId)
  }

  private get generalActions(): PhaseAction[] {
    const actions: PhaseAction[] = []

    if (this.investigatorState.canDraw()) {
      actions.push({
        type: 'draw',
        controllerId: this.controllerId,
        execute: (coordinator) =>
          coordinator
            .waitFor(
              createEffectPhase(this.context, this.controllerId, {
                type: 'enemyOpportunityAttack',
                target: 'self',
              })
            )
            .waitFor(
              createEffectPhase(this.context, this.controllerId, {
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
        controllerId: this.controllerId,
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
        controllerId: this.controllerId,
        locationId: location.id,
        execute: (coordinator) =>
          coordinator
            .waitFor(
              createEffectPhase(this.context, this.controllerId, {
                type: 'enemyOpportunityAttack',
                target: 'self',
              })
            )
            .apply(() => {
              // TODO: create move effect
              const engagedEnemyIndexes = this.context.getEngagedEnemies(
                this.controllerId
              )
              engagedEnemyIndexes.forEach((index) => {
                const enemyState = this.context.getEnemyState(index)
                enemyState.disengage()
              })

              this.context.moveInvestigator(this.controllerId, location.id)

              this.context
                .getLocationEnemies(location.id)
                .map((index) => this.context.getEnemyState(index))
                .forEach((enemyState) => {
                  if (enemyState.isReady()) {
                    enemyState.engage(this.controllerId)
                  }
                })

              this.actionsMade++
            }),
      })
    })

    if (this.context.locationStates.get(currentLocation.id)!.clues > 0) {
      actions.push({
        type: 'investigate',
        controllerId: this.controllerId,
        locationId: currentLocation.id,
        execute: (coordinator) =>
          coordinator
            .waitFor(
              createEffectPhase(this.context, this.controllerId, {
                type: 'enemyOpportunityAttack',
                target: 'self',
              })
            )
            .waitFor(
              createEffectPhase(this.context, this.controllerId, {
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

      if (!canUseEffect(this.context, this.controllerId, card.effect)) {
        return
      }

      actions.push({
        type: 'play',
        controllerId: this.controllerId,
        cardIndex: index,
        execute: (coordinator) => {
          if (provokesOpportunityAttack(card.effect)) {
            coordinator = coordinator.waitFor(
              createEffectPhase(this.context, this.controllerId, {
                type: 'enemyOpportunityAttack',
                target: 'self',
              })
              // TODO: fix typing
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ) as any
          }

          coordinator
            .apply(() => {
              this.investigatorState.discard(index)
              this.actionsMade++
            })
            .waitFor(
              createEffectPhase(this.context, this.controllerId, card.effect)
            )
        },
      })
    })

    return actions
  }

  private get enemyActions(): PhaseAction[] {
    const actions: PhaseAction[] = []

    const enemies = this.context.getLocationEnemies(
      this.investigatorState.currentLocation
    )

    enemies.forEach((enemyIndex) => {
      actions.push({
        type: 'attack',
        controllerId: this.controllerId,
        enemyIndex,
        execute: (coordinator) =>
          coordinator
            .waitFor(
              createEffectPhase(this.context, this.controllerId, {
                type: 'attackEnemy',
                skill: 'strength',
                amount: 1,
                target: {
                  enemyIndex,
                },
              })
            )
            .apply(() => {
              this.actionsMade++
            }),
      })
    })

    return actions
  }
}

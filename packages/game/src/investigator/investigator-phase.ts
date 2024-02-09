import { Context } from '../context'
import { LocationId, isConnected } from '../location'
import { InvestigatorId } from './investigator'
import { createSkillCheckPhase } from '../skill-check'
import { createDoomPhase } from '../doom'
import { CreatePhase, Phase, PhaseAction, createWinGamePhase } from '../phase'
import { createEnemyAttackPhase, createEnemyPhase } from '../enemy'
import { createActionPhase } from '../action'

export type InvestigatorContext = {
  actionsMade: number
}

export const INVESTIGATOR_ACTIONS_PER_TURN = 3

export type InvestigatorPhase = CreatePhase<'investigator'> & {
  investigatorContext: InvestigatorContext
}

export function createInvestigatorPhase(
  context: Context,
  investigatorContext: InvestigatorContext = { actionsMade: 0 }
): InvestigatorPhase {
  // TODO: add current investigator
  const investigatorId = context.investigators[0].id

  function executeAction(nextPhase: (context: Context) => Phase) {
    investigatorContext.actionsMade++

    return createEnemyAttackPhase(context, {
      investigatorId,
      nextPhase,
    })
  }

  function getActions() {
    const actions: PhaseAction[] = []
    const investigatorState = context.getInvestigatorState(investigatorId)

    actions.push({
      type: 'endInvestigationPhase',
      investigatorId,
      execute: () => createEnemyPhase(context),
    })

    if (investigatorContext.actionsMade >= INVESTIGATOR_ACTIONS_PER_TURN) {
      return actions
    }

    if (investigatorState.canDraw()) {
      actions.push({
        type: 'draw',
        investigatorId,
        execute: () =>
          executeAction((context) => {
            investigatorState.draw()
            return createInvestigatorPhase(context, investigatorContext)
          }),
      })
    }

    const cardsInHand = investigatorState.getCardsInHand()
    cardsInHand.forEach((card, index) => {
      if (card.type === 'permanent') {
        actions.push({
          type: 'play',
          investigatorId,
          handCardIndex: index,
          execute: () =>
            executeAction((context) => {
              investigatorState.play(index)
              return createInvestigatorPhase(context, investigatorContext)
            }),
        })
      }

      if (card.type === 'effect') {
        actions.push({
          type: 'play',
          investigatorId,
          handCardIndex: index,
          execute: () =>
            executeAction((context) => {
              if (card.effect) {
                context = card.effect.apply(context, {
                  investigatorId,
                  locationId: investigatorState.currentLocation,
                })
              }

              investigatorState.discard(index)

              const skillCheck = card.skillCheck
              if (skillCheck) {
                return createSkillCheckPhase(context, {
                  investigatorId,
                  locationId: investigatorState.currentLocation,
                  skillModifier: 0,
                  addedCards: [],
                  check: skillCheck,
                  nextPhase: (context) =>
                    createInvestigatorPhase(context, investigatorContext),
                })
              }

              return createInvestigatorPhase(context, investigatorContext)
            }),
        })
      }

      if (card.type === 'action') {
        actions.push({
          type: 'play',
          investigatorId,
          handCardIndex: index,
          execute: () =>
            executeAction((context) => {
              return createActionPhase(context, {
                action: card.action,
                nextPhase: (context) => {
                  investigatorState.discard(index)
                  return createInvestigatorPhase(context, investigatorContext)
                },
              })
            }),
        })
      }
    })

    context.locationStates.forEach((state, locationId) => {
      const locationActions = getLocationActions(locationId, investigatorId)
      actions.push(...locationActions)
    })

    actions.push(...getEnemyActions(investigatorId))

    return actions
  }

  function getLocationActions(
    locationId: LocationId,
    investigatorId: InvestigatorId
  ): PhaseAction[] {
    const actions: PhaseAction[] = []

    const currentLocation = context.getInvestigatorLocation(investigatorId)
    const location = context.getLocation(locationId)

    if (isConnected(currentLocation, location)) {
      actions.push({
        type: 'move',
        investigatorId,
        locationId,
        execute: () =>
          executeAction((context) => {
            context.moveInvestigator(investigatorId, locationId)
            context.moveEngagedEnemies(investigatorId, locationId)

            return createInvestigatorPhase(context, investigatorContext)
          }),
      })
    }

    if (currentLocation.id === locationId) {
      const locationState = context.locationStates.get(locationId)

      if (locationState && locationState.clues > 0) {
        actions.push({
          type: 'investigate',
          investigatorId,
          locationId,
          execute: () =>
            executeAction((context) =>
              createSkillCheckPhase(context, {
                investigatorId,
                locationId,
                skillModifier: 0,
                addedCards: [],
                check: {
                  skill: 'intelligence',
                  difficulty: location.shroud,
                  onSuccess: {
                    apply: (context) =>
                      context.collectClue(investigatorId, locationId),
                  },
                  onFailure: {
                    apply: (context) => context,
                  },
                },
                nextPhase: (context) => {
                  const scene = context.getSceneCard()
                  const totalClues = context.getTotalInvestigatorClues()
                  if (scene.clueTreshold <= totalClues) {
                    context.investigatorStates.forEach((state) => {
                      state.clues = 0
                    })
                    return createAdvanceScenePhase(context, investigatorContext)
                  }

                  return createInvestigatorPhase(context, investigatorContext)
                },
              })
            ),
        })
      }
    }

    return actions
  }

  function getEnemyActions(investigatorId: InvestigatorId): PhaseAction[] {
    const actions: PhaseAction[] = []

    const investigator = context.getInvestigatorState(investigatorId)
    const locationId = investigator.currentLocation
    const enemies = context.getLocationEnemies(locationId)

    if (enemies) {
      enemies.forEach((enemy, index) => {
        actions.push({
          type: 'attack',
          investigatorId,
          locationId,
          enemyIndex: index,
          execute: () =>
            createSkillCheckPhase(context, {
              check: {
                skill: 'strength',
                difficulty: enemy.strength,
                onSuccess: {
                  apply: (context) => {
                    enemy.addDamage(context, 1)
                    return context
                  },
                },
                onFailure: {
                  apply: (context) => context,
                },
              },
              investigatorId,
              locationId,
              skillModifier: 0,
              addedCards: [],
              nextPhase: (context) => {
                investigatorContext.actionsMade++
                return createInvestigatorPhase(context, investigatorContext)
              },
            }),
        })
      })
    }

    return actions
  }

  return {
    type: 'investigator',
    context,
    investigatorContext,
    actions: getActions(),
  }
}

export type CleanupPhase = CreatePhase<'cleanup'>

export function createCleanupPhase(context: Context): CleanupPhase {
  const actions: PhaseAction[] = []

  actions.push({
    type: 'endCleanupPhase',
    execute: () => {
      context.investigators.forEach((investigator) => {
        context.getInvestigatorState(investigator.id).draw()
      })

      return createDoomPhase(context)
    },
  })

  return {
    type: 'cleanup',
    actions,
    context,
  }
}

export type AdvanceScenePhase = CreatePhase<'advanceScene'> & {
  investigatorContext: InvestigatorContext
}

export function createAdvanceScenePhase(
  context: Context,
  investigatorContext: InvestigatorContext
): AdvanceScenePhase {
  const actions: PhaseAction[] = []

  actions.push({
    type: 'endAdvanceScenePhase',
    execute: () => {
      const nextSceneCardId = context.getNextSceneCardId()

      if (!nextSceneCardId) {
        return createWinGamePhase(context)
      }

      context.sceneState.sceneCardId = nextSceneCardId
      return createInvestigatorPhase(context, investigatorContext)
    },
  })

  return {
    type: 'advanceScene',
    actions,
    context,
    investigatorContext,
  }
}

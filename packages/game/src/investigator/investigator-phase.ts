import { Context } from '../context'
import { LocationId, isConnected } from '../location'
import { InvestigatorId } from './investigator'
import { createSkillCheckPhase } from '../skill-check'
import { createDoomPhase } from '../doom'
import { CreatePhase, PhaseAction, createWinGamePhase } from '../phase'

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
  function getActions() {
    const actions: PhaseAction[] = []

    // TODO: add current investigator
    const investigatorId = context.investigators[0].id
    const investigatorState = context.getInvestigatorState(investigatorId)

    actions.push({
      type: 'endInvestigationPhase',
      investigatorId,
      execute: () => createCleanupPhase(context),
    })

    if (investigatorContext.actionsMade >= INVESTIGATOR_ACTIONS_PER_TURN) {
      return actions
    }

    if (investigatorState.canDraw()) {
      actions.push({
        type: 'draw',
        investigatorId,
        execute: () => {
          investigatorState.draw()
          investigatorContext.actionsMade++
          return createInvestigatorPhase(context, investigatorContext)
        },
      })
    }

    const cardsInHand = investigatorState.getCardsInHand()
    cardsInHand.forEach((card, index) => {
      if (card.type === 'permanent') {
        actions.push({
          type: 'play',
          investigatorId,
          handCardIndex: index,
          execute: () => {
            investigatorState.play(index)
            investigatorContext.actionsMade++
            return createInvestigatorPhase(context, investigatorContext)
          },
        })
      }

      if (card.type === 'effect') {
        actions.push({
          type: 'play',
          investigatorId,
          handCardIndex: index,
          execute: () => {
            if (card.effect) {
              context = card.effect.apply(context, {
                investigatorId,
                locationId: investigatorState.currentLocation,
              })
            }

            investigatorState.discard(index)
            investigatorContext.actionsMade++

            if (card.skillCheck) {
              return createSkillCheckPhase(context, {
                investigatorId,
                locationId: investigatorState.currentLocation,
                skillModifier: 0,
                addedCards: [],
                check: card.skillCheck,
                nextPhase: (context) =>
                  createInvestigatorPhase(context, investigatorContext),
              })
            }

            return createInvestigatorPhase(context, investigatorContext)
          },
        })
      }
    })

    context.locationStates.forEach((state, locationId) => {
      const locationActions = getLocationActions(locationId, investigatorId)
      actions.push(...locationActions)
    })

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
        execute: () => {
          const newContext = context.moveInvestigator(
            investigatorId,
            locationId
          )
          investigatorContext.actionsMade++

          return createInvestigatorPhase(newContext, investigatorContext)
        },
      })
    }

    if (currentLocation.id === locationId) {
      const locationState = context.locationStates.get(locationId)

      if (locationState && locationState.clues > 0) {
        actions.push({
          type: 'investigate',
          investigatorId,
          locationId,
          execute: () => {
            investigatorContext.actionsMade++

            return createSkillCheckPhase(context, {
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
          },
        })
      }
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
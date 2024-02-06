import {
  Context,
  canDrawFromDeck,
  collectClue,
  discardCurrentEncounterCard,
  drawEncounterCard,
  drawFromDeck,
  getDoomCard,
  getEncounterCard,
  getInvestigatorCardsInHand,
  getInvestigatorLocation,
  getLocation,
  getNextDoomCardId,
  getNextSceneCardId,
  getSceneCard,
  getTotalInvestigatorClues,
  moveInvestigator,
  playCardFromHand,
} from './context'
import { LocationId, isConnected } from './location'
import { InvestigatorId } from './investigator'
import {
  SkillCheckPhase,
  CommitSkillCheckPhase,
  createSkillCheckPhase,
} from './skill-check'

export type PhaseActionReturn = Phase

export type PhaseAction = {
  type: string
  locationId?: LocationId
  investigatorId?: InvestigatorId
  handCardIndex?: number
  execute: () => PhaseActionReturn
}

export type Phase =
  | InvestigatorPhase
  | CleanupPhase
  | DoomPhase
  | AdvanceDoomPhase
  | AdvanceScenePhase
  | EndGamePhase
  | WinGamePhase
  | EncounterPhase
  | HandleEncounterPhase
  | SkillCheckPhase
  | CommitSkillCheckPhase

export type CreatePhase<Type extends string> = {
  type: Type
  actions: PhaseAction[]
  context: Context
}

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

    actions.push({
      type: 'endInvestigationPhase',
      investigatorId,
      execute: () => createCleanupPhase(context),
    })

    if (investigatorContext.actionsMade >= INVESTIGATOR_ACTIONS_PER_TURN) {
      return actions
    }

    if (canDrawFromDeck(context, investigatorId)) {
      actions.push({
        type: 'draw',
        investigatorId,
        execute: () => {
          const newContext = drawFromDeck(context, investigatorId)
          investigatorContext.actionsMade++
          return createInvestigatorPhase(newContext, investigatorContext)
        },
      })
    }

    const cardsInHand = getInvestigatorCardsInHand(context, investigatorId)
    cardsInHand.forEach((card, index) => {
      if (card.permanentSkillModifier !== undefined) {
        actions.push({
          type: 'play',
          investigatorId,
          handCardIndex: index,
          execute: () => {
            const newContext = playCardFromHand(context, investigatorId, index)
            investigatorContext.actionsMade++
            return createInvestigatorPhase(newContext, investigatorContext)
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

    const currentLocation = getInvestigatorLocation(context, investigatorId)
    const location = getLocation(context, locationId)

    if (isConnected(currentLocation, location)) {
      actions.push({
        type: 'move',
        investigatorId,
        locationId,
        execute: () => {
          const newContext = moveInvestigator(
            context,
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
                    collectClue(context, investigatorId, locationId),
                },
                onFailure: {
                  apply: (context) => context,
                },
              },
              nextPhase: (context) => {
                const scene = getSceneCard(context)
                const totalClues = getTotalInvestigatorClues(context)
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
        if (canDrawFromDeck(context, investigator.id)) {
          context = drawFromDeck(context, investigator.id)
        }
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

export type DoomPhase = CreatePhase<'doom'>

export function createDoomPhase(context: Context): DoomPhase {
  const actions: PhaseAction[] = []

  actions.push({
    type: 'endDoomPhase',
    execute: () => {
      context.doomState.doom++

      if (context.doomState.doom >= getDoomCard(context).treshold) {
        return createAdvanceDoomPhase(context)
      }

      return createEncounterPhase(context)
    },
  })

  return {
    type: 'doom',
    actions,
    context,
  }
}

export type AdvanceDoomPhase = CreatePhase<'advanceDoom'>

export function createAdvanceDoomPhase(context: Context): AdvanceDoomPhase {
  const actions: PhaseAction[] = []

  actions.push({
    type: 'endAdvanceDoomPhase',
    execute: () => {
      const nextDoomCardId = getNextDoomCardId(context)

      if (!nextDoomCardId) {
        return createEndGamePhase(context)
      }

      context.doomState.doomCardId = nextDoomCardId
      context.doomState.doom = 0
      return createEncounterPhase(context)
    },
  })

  return {
    type: 'advanceDoom',
    actions,
    context,
  }
}

export type EncounterPhase = CreatePhase<'encounter'>

export function createEncounterPhase(context: Context): EncounterPhase {
  context = discardCurrentEncounterCard(context)

  const actions: PhaseAction[] = []

  if (
    context.encounterState.investigatorId !==
    context.investigators[context.investigators.length - 1].id
  ) {
    actions.push({
      type: 'drawEncounter',
      // TODO: add current investigator
      investigatorId: context.investigators[0].id,
      execute: () => {
        const newContext = drawEncounterCard(context)
        newContext.encounterState.investigatorId =
          newContext.investigators[0].id
        return createHandleEncounterPhase(newContext)
      },
    })
  } else {
    actions.push({
      type: 'endEncounterPhase',
      execute: () => {
        context.encounterState.investigatorId = null
        return createInvestigatorPhase(context)
      },
    })
  }

  return {
    type: 'encounter',
    actions,
    context,
  }
}

export type HandleEncounterPhase = CreatePhase<'handleEncounter'>

export function createHandleEncounterPhase(
  context: Context
): HandleEncounterPhase {
  const actions: PhaseAction[] = []

  const encounterCard = getEncounterCard(
    context,
    context.encounterState.currentCardId!
  )

  const { effect, skillCheck } = encounterCard

  if (effect && !skillCheck) {
    actions.push({
      type: 'endHandleEncounterPhase',
      execute: () => {
        context = effect.apply(context)
        return createEncounterPhase(context)
      },
    })
  }

  if (skillCheck) {
    actions.push({
      type: 'startSkillCheck',
      execute: () => {
        if (effect) {
          context = effect.apply(context)
        }

        return createSkillCheckPhase(context, {
          check: skillCheck,
          investigatorId: context.encounterState.investigatorId!,
          locationId: getInvestigatorLocation(
            context,
            context.encounterState.investigatorId!
          ).id,
          nextPhase: (context) => createEncounterPhase(context),
          skillModifier: 0,
          addedCards: [],
        })
      },
    })
  }

  return {
    type: 'handleEncounter',
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
      const nextSceneCardId = getNextSceneCardId(context)

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

export type EndGamePhase = CreatePhase<'endGame'>

export function createEndGamePhase(context: Context): EndGamePhase {
  return {
    type: 'endGame',
    actions: [],
    context,
  }
}

export type WinGamePhase = CreatePhase<'winGame'>

export function createWinGamePhase(context: Context): WinGamePhase {
  return {
    type: 'winGame',
    actions: [],
    context,
  }
}

import {
  Context,
  canDrawFromDeck,
  collectClue,
  discardCurrentEncounterCard,
  discardFromHand,
  drawEncounterCard,
  drawFromDeck,
  getDoomCard,
  getEncounterCard,
  getInvestigatorCardsInHand,
  getInvestigatorLocation,
  getInvestigatorSkills,
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
import { Fate, spinFateWheel } from './fate'
import { SkillCheck } from './encounter'

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
  | StartInvestigationSkillCheckPhase
  | CommitInvestigationSkillCheckPhase
  | DoomPhase
  | AdvanceDoomPhase
  | AdvanceScenePhase
  | EndGamePhase
  | WinGamePhase
  | EncounterPhase
  | HandleEncounterPhase
  | EncounterSkillCheckPhase
  | CommitEncounterSkillCheckPhase

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
            return createStartInvestigationSkillCheck(
              context,
              investigatorContext,
              {
                investigatorId,
                locationId,
                skillModifier: 0,
              }
            )
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

export type InvestigationContext = {
  locationId: LocationId
  investigatorId: InvestigatorId
  skillModifier: number
}

export type StartInvestigationSkillCheckPhase =
  CreatePhase<'startInvestigationSkillCheck'> & {
    investigatorContext: InvestigatorContext
    investigationContext: InvestigationContext
  }

export function createStartInvestigationSkillCheck(
  context: Context,
  investigatorContext: InvestigatorContext,
  investigationContext: InvestigationContext
): StartInvestigationSkillCheckPhase {
  function getActions() {
    const actions: PhaseAction[] = []

    actions.push({
      type: 'commitSkillCheck',
      investigatorId: investigationContext.investigatorId,
      execute: () => {
        const fate = spinFateWheel(context.scenario.fateWheel)

        const skills = getInvestigatorSkills(
          context,
          investigationContext.investigatorId
        )
        const skill = fate.modifySkillCheck(
          skills.intelligence + investigationContext.skillModifier
        )

        const location = getLocation(context, investigationContext.locationId)
        const difficulty = location.shroud

        return createCommitInvestigationSkillCheck(
          context,
          investigatorContext,
          investigationContext,
          {
            fate,
            skill,
            difficulty,
          }
        )
      },
    })

    const cardsInHand = getInvestigatorCardsInHand(
      context,
      investigationContext.investigatorId
    )
    cardsInHand.forEach((card, index) => {
      actions.push({
        type: 'addToSkillCheck',
        investigatorId: investigationContext.investigatorId,
        handCardIndex: index,
        execute: () => {
          const skillModifier = card.skillModifier.intelligence ?? 0
          investigationContext.skillModifier += skillModifier

          discardFromHand(context, investigationContext.investigatorId, index)

          return createStartInvestigationSkillCheck(
            context,
            investigatorContext,
            investigationContext
          )
        },
      })
    })

    return actions
  }

  return {
    type: 'startInvestigationSkillCheck',
    context,
    investigatorContext,
    investigationContext,
    actions: getActions(),
  }
}

export type SkillCheckContext = {
  skill: number
  difficulty: number
  fate: Fate
}

export type CommitInvestigationSkillCheckPhase =
  CreatePhase<'commitInvestigationSkillCheck'> & {
    investigatorContext: InvestigatorContext
    investigationContext: InvestigationContext
    skillCheckContext: SkillCheckContext
  }

export function createCommitInvestigationSkillCheck(
  context: Context,
  investigatorContext: InvestigatorContext,
  investigationContext: InvestigationContext,
  skillCheckContext: SkillCheckContext
): CommitInvestigationSkillCheckPhase {
  function getActions() {
    const actions: PhaseAction[] = []

    actions.push({
      type: 'endSkillCheck',
      investigatorId: investigationContext.investigatorId,
      execute: () => {
        if (skillCheckContext.skill < skillCheckContext.difficulty) {
          return createInvestigatorPhase(context, investigatorContext)
        }

        const newContext = collectClue(
          context,
          investigationContext.investigatorId,
          investigationContext.locationId
        )

        const scene = getSceneCard(newContext)
        const totalClues = getTotalInvestigatorClues(newContext)
        if (scene.clueTreshold <= totalClues) {
          context.investigatorStates.forEach((state) => {
            state.clues = 0
          })
          return createAdvanceScenePhase(newContext, investigatorContext)
        }

        return createInvestigatorPhase(newContext, investigatorContext)
      },
    })

    return actions
  }

  return {
    type: 'commitInvestigationSkillCheck',
    context,
    investigatorContext,
    investigationContext,
    skillCheckContext,
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

        return createEncounterSkillCheckPhase(context, {
          check: skillCheck,
          skillModifier: 0,
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

export type EncounterContext = {
  check: SkillCheck
  skillModifier: number
}

export type EncounterSkillCheckPhase = CreatePhase<'encounterSkillCheck'> & {
  encounterContext: EncounterContext
}

export function createEncounterSkillCheckPhase(
  context: Context,
  encounterContext: EncounterContext
): EncounterSkillCheckPhase {
  const actions: PhaseAction[] = []

  const investigatorId = context.encounterState.investigatorId!

  actions.push({
    type: 'commitSkillCheck',
    investigatorId,
    execute: () => {
      const fate = spinFateWheel(context.scenario.fateWheel)

      const skills = getInvestigatorSkills(context, investigatorId)
      const skill = fate.modifySkillCheck(
        skills[encounterContext.check.skill] + encounterContext.skillModifier
      )

      return createCommitEncounterSkillCheckPhase(context, encounterContext, {
        fate,
        skill,
        difficulty: encounterContext.check.difficulty,
      })
    },
  })

  const cardsInHand = getInvestigatorCardsInHand(context, investigatorId)
  cardsInHand.forEach((card, index) => {
    actions.push({
      type: 'addToSkillCheck',
      investigatorId: investigatorId,
      handCardIndex: index,
      execute: () => {
        const skillModifier =
          card.skillModifier[encounterContext.check.skill] ?? 0
        encounterContext.skillModifier += skillModifier

        discardFromHand(context, investigatorId, index)

        return createEncounterSkillCheckPhase(context, encounterContext)
      },
    })
  })

  return {
    type: 'encounterSkillCheck',
    actions,
    context,
    encounterContext,
  }
}

export type CommitEncounterSkillCheckPhase =
  CreatePhase<'commitEncounterSkillCheck'> & {
    encounterContext: EncounterContext
    skillCheckContext: SkillCheckContext
  }

export function createCommitEncounterSkillCheckPhase(
  context: Context,
  encounterContext: EncounterContext,
  skillCheckContext: SkillCheckContext
): CommitEncounterSkillCheckPhase {
  const actions: PhaseAction[] = []

  actions.push({
    type: 'endSkillCheck',
    investigatorId: context.encounterState.investigatorId!,
    execute: () => {
      if (skillCheckContext.skill < skillCheckContext.difficulty) {
        context = encounterContext.check.onFailure.apply(context)
        return createEncounterPhase(context)
      }

      context = encounterContext.check.onSuccess.apply(context)
      return createEncounterPhase(context)
    },
  })

  return {
    type: 'commitEncounterSkillCheck',
    actions,
    context,
    encounterContext,
    skillCheckContext,
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

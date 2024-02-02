import {
  Context,
  canDrawFromDeck,
  collectClue,
  discardFromHand,
  drawFromDeck,
  getInvestigator,
  getInvestigatorCardsInHand,
  getInvestigatorLocation,
  getLocation,
  moveInvestigator,
} from './context'
import { LocationId, isConnected } from './location'
import { InvestigatorId } from './investigator'
import { Fate, spinFateWheel } from './fate'

export type PhaseActionReturn = Phase

export type PhaseAction = {
  type: string
  locationId?: LocationId
  investigatorId?: InvestigatorId
  handCardIndex?: number
  execute: () => PhaseActionReturn
}

export type Phase =
  | InvestigationPhase
  | CleanupPhase
  | StartInvestigationSkillCheckPhase
  | CommitInvestigationSkillCheckPhase

export type CreatePhase<Type extends string> = {
  type: Type
  actions: PhaseAction[]
  context: Context
}

export type InvestigationPhase = CreatePhase<'investigation'>

export function createInvestigationPhase(context: Context): InvestigationPhase {
  function getActions() {
    const actions: PhaseAction[] = []

    // TODO: add current investigator
    const investigatorId = context.investigators[0].id

    if (canDrawFromDeck(context, investigatorId)) {
      actions.push({
        type: 'draw',
        investigatorId,
        execute: () => {
          const newContext = drawFromDeck(context, investigatorId)
          return createInvestigationPhase(newContext)
        },
      })
    }

    actions.push({
      type: 'endInvestigationPhase',
      investigatorId,
      execute: () => createCleanupPhase(context),
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

          return createInvestigationPhase(newContext)
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
          execute: () =>
            createStartInvestigationSkillCheck(context, {
              investigatorId,
              locationId,
              skillModifier: 0,
            }),
        })
      }
    }

    return actions
  }

  return {
    type: 'investigation',
    context,
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
    investigationContext: InvestigationContext
  }

export function createStartInvestigationSkillCheck(
  context: Context,
  investigationContext: InvestigationContext
): StartInvestigationSkillCheckPhase {
  function getActions() {
    const actions: PhaseAction[] = []

    actions.push({
      type: 'commitSkillCheck',
      investigatorId: investigationContext.investigatorId,
      execute: () => {
        const fate = spinFateWheel(context.scenario.fateWheel)

        const investigator = getInvestigator(
          context,
          investigationContext.investigatorId
        )
        const skill = fate.modifySkillCheck(
          investigator.baseSkills.intelligence +
            investigationContext.skillModifier
        )

        const location = getLocation(context, investigationContext.locationId)
        const difficulty = location.shroud

        return createCommitInvestigationSkillCheck(
          context,
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
        type: 'play',
        investigatorId: investigationContext.investigatorId,
        handCardIndex: index,
        execute: () => {
          const skillModifier = card.skillModifier.intelligence ?? 0
          investigationContext.skillModifier += skillModifier

          discardFromHand(context, investigationContext.investigatorId, index)

          return createStartInvestigationSkillCheck(
            context,
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
    investigationContext: InvestigationContext
    skillCheckContext: SkillCheckContext
  }

export function createCommitInvestigationSkillCheck(
  context: Context,
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
          return createInvestigationPhase(context)
        }

        const newContext = collectClue(
          context,
          investigationContext.investigatorId,
          investigationContext.locationId
        )

        return createInvestigationPhase(newContext)
      },
    })

    return actions
  }

  return {
    type: 'commitInvestigationSkillCheck',
    context,
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
    // TODO: add current investigator
    investigatorId: context.investigators[0].id,
    execute: () => createInvestigationPhase(context),
  })

  return {
    type: 'cleanup',
    actions,
    context,
  }
}

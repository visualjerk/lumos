import {
  Context,
  collectClue,
  getInvestigator,
  getInvestigatorLocation,
  getLocation,
  moveInvestigator,
} from './context'
import { InvestigatorId, LocationId, isConnected } from './card'

export type PhaseActionReturn = Phase

export type PhaseAction = {
  type: string
  locationId?: LocationId
  investigatorId?: InvestigatorId
  execute: () => PhaseActionReturn
}

export type PhaseType =
  | 'investigation'
  | 'cleanup'
  | 'startSkillCheck'
  | 'commitSkillCheck'

export type Phase = {
  type: PhaseType
  actions: PhaseAction[]
  context: Context
}

export function createInvestigationPhase(context: Context): Phase {
  function getActions() {
    const actions: PhaseAction[] = []

    // TODO: add current investigator
    const investigatorId = context.investigatorCards[0].id

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

type InvestigationContext = {
  locationId: LocationId
  investigatorId: InvestigatorId
  skillModifier: number
}

export function createStartInvestigationSkillCheck(
  context: Context,
  investigationContext: InvestigationContext
): Phase {
  function getActions() {
    const actions: PhaseAction[] = []

    actions.push({
      type: 'commitSkillCheck',
      investigatorId: investigationContext.investigatorId,
      execute: () =>
        createCommitInvestigationSkillCheck(context, investigationContext),
    })

    actions.push({
      type: 'decreaseSkillCheck',
      investigatorId: investigationContext.investigatorId,
      execute: () => {
        investigationContext.skillModifier--
        return createStartInvestigationSkillCheck(context, investigationContext)
      },
    })

    actions.push({
      type: 'increaseSkillCheck',
      investigatorId: investigationContext.investigatorId,
      execute: () => {
        investigationContext.skillModifier++
        return createStartInvestigationSkillCheck(context, investigationContext)
      },
    })

    return actions
  }

  return {
    type: 'startSkillCheck',
    context,
    actions: getActions(),
  }
}

export function createCommitInvestigationSkillCheck(
  context: Context,
  investigationContext: InvestigationContext
): Phase {
  function getActions() {
    const actions: PhaseAction[] = []

    actions.push({
      type: 'endSkillCheck',
      investigatorId: investigationContext.investigatorId,
      execute: () => {
        const investigator = getInvestigator(
          context,
          investigationContext.investigatorId
        )
        const location = getLocation(context, investigationContext.locationId)

        const totalSkill =
          investigator.baseStats.intelligence +
          investigationContext.skillModifier

        if (totalSkill < location.shroud) {
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
    type: 'commitSkillCheck',
    context,
    actions: getActions(),
  }
}

export function createCleanupPhase(context: Context): Phase {
  const actions: PhaseAction[] = []

  actions.push({
    type: 'endCleanupPhase',
    // TODO: add current investigator
    investigatorId: context.investigatorCards[0].id,
    execute: () => createInvestigationPhase(context),
  })

  return {
    type: 'cleanup',
    actions,
    context,
  }
}

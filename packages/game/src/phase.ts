import {
  Context,
  collectClue,
  getInvestigatorLocation,
  getLocation,
  moveInvestigator,
} from './context'
import { InvestigatorId, LocationId, isConnected } from './card'

export type PhaseActionReturn = {
  nextPhase?: Phase
  newContext?: Context
}

export type PhaseAction = {
  type: string
  locationId?: LocationId
  investigatorId?: InvestigatorId
  execute: () => PhaseActionReturn
}

export type PhaseType = 'investigation' | 'cleanup'

export type Phase = {
  type: PhaseType
  actions: PhaseAction[]
  applyContext: (context: Context) => Phase
}

export function createInvestigationPhase(context: Context): Phase {
  function getActions() {
    const actions: PhaseAction[] = []

    // TODO: add current investigator
    const investigatorId = context.investigatorCards[0].id

    actions.push({
      type: 'endInvestigationPhase',
      investigatorId,
      execute: () => {
        return {
          nextPhase: createCleanupPhase(context),
        }
      },
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

          return {
            newContext,
          }
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
            const newContext = collectClue(context, investigatorId, locationId)

            return {
              newContext,
            }
          },
        })
      }
    }

    return actions
  }

  return {
    type: 'investigation',
    actions: getActions(),
    applyContext: (context) => createInvestigationPhase(context),
  }
}

export function createCleanupPhase(context: Context): Phase {
  const actions: PhaseAction[] = []

  actions.push({
    type: 'endCleanupPhase',
    // TODO: add current investigator
    investigatorId: context.investigatorCards[0].id,
    execute: () => {
      return {
        nextPhase: createInvestigationPhase(context),
      }
    },
  })

  return {
    type: 'cleanup',
    actions,
    applyContext: (context) => createCleanupPhase(context),
  }
}

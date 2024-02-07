import { Context } from '../context'
import { createSkillCheckPhase } from '../skill-check'
import { CreatePhase, PhaseAction } from '../phase'
import { createInvestigatorPhase } from '../investigator'

export type EncounterPhase = CreatePhase<'encounter'>

export function createEncounterPhase(context: Context): EncounterPhase {
  context.encounterState.discardCurrent()

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
        context.encounterState.draw()
        context.encounterState.investigatorId = context.investigators[0].id
        return createHandleEncounterPhase(context)
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

  const encounterCard = context.getEncounterCard(
    context.encounterState.currentCardId!
  )

  const { effect, skillCheck } = encounterCard

  if (effect && !skillCheck) {
    actions.push({
      type: 'endHandleEncounterPhase',
      execute: () => {
        context = effect.apply(context, {
          investigatorId: context.encounterState.investigatorId!,
        })
        return createEncounterPhase(context)
      },
    })
  }

  if (skillCheck) {
    actions.push({
      type: 'startSkillCheck',
      execute: () => {
        if (effect) {
          context = effect.apply(context, {
            investigatorId: context.encounterState.investigatorId!,
          })
        }

        return createSkillCheckPhase(context, {
          check: skillCheck,
          investigatorId: context.encounterState.investigatorId!,
          locationId: context.getInvestigatorLocation(
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

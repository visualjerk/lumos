import { Context } from '../context'
import { createEncounterPhase } from '../encounter'
import { CreatePhase, PhaseAction, createEndGamePhase } from '../phase'

export type DoomPhase = CreatePhase<'doom'>

export function createDoomPhase(context: Context): DoomPhase {
  const actions: PhaseAction[] = []

  actions.push({
    type: 'endDoomPhase',
    execute: () => {
      context.doomState.doom++

      if (context.doomState.doom >= context.getDoomCard().treshold) {
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
      const nextDoomCardId = context.getNextDoomCardId()

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

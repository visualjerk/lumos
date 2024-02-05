import { InvestigatorId } from '../investigator'
import { EncounterCardId } from './encounter-card'
import { shuffleArray } from '../utils'

export type EncounterState = {
  deck: EncounterCardId[]
  discardPile: EncounterCardId[]
  currentCardId: EncounterCardId | null
  investigatorId: InvestigatorId | null
}

export function draw(state: EncounterState): EncounterState {
  if (state.deck.length === 0) {
    state.deck = state.discardPile
    state.discardPile = []
    shuffle(state)
  }

  state.currentCardId = state.deck.pop()!

  return state
}

export function discardCurrent(state: EncounterState): EncounterState {
  if (!state.currentCardId) {
    return state
  }

  state.discardPile.push(state.currentCardId!)
  state.currentCardId = null

  return state
}

export function shuffle(state: EncounterState): EncounterState {
  state.deck = shuffleArray(state.deck)

  return state
}

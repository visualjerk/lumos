import { InvestigatorId } from '../investigator'
import { EncounterCardId } from './encounter-card'

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
    throw new Error('No current card to discard')
  }

  state.discardPile.push(state.currentCardId!)

  return state
}

export function shuffle(state: EncounterState): EncounterState {
  state.deck = shuffleArray(state.deck)

  return state
}

function shuffleArray(array: any[]) {
  const shuffled = [...array]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}

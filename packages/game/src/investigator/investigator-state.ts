import type { LocationId } from '../location'
import type { Investigator, InvestigatorId } from './investigator'
import type { InvestigatorCardId } from './investigator-card'

export type InvestigatorState = {
  currentHealth: number
  clues: number
  currentLocation: LocationId
  cardsInHand: InvestigatorCardId[]
  cardsInPlay: InvestigatorCardId[]
  deck: InvestigatorCardId[]
  discardPile: InvestigatorCardId[]
}

export class InvestigatorStates extends Map<InvestigatorId, InvestigatorState> {
  constructor(investigators: Investigator[], currentLocation: LocationId) {
    super(
      investigators.map((investigator) => [
        investigator.id,
        {
          currentHealth: investigator.health,
          clues: 0,
          currentLocation,
          cardsInHand: [],
          cardsInPlay: [],
          deck: shuffleArray(investigator.baseDeck),
          discardPile: [],
        },
      ])
    )
  }
}

export function canDraw(state: InvestigatorState): boolean {
  return state.deck.length > 0 || state.discardPile.length > 0
}

export function draw(state: InvestigatorState): InvestigatorState {
  if (state.deck.length === 0) {
    state.deck = state.discardPile
    state.discardPile = []
    shuffle(state)
  }

  state.cardsInHand.push(state.deck.pop()!)

  return state
}

export function discard(
  state: InvestigatorState,
  cardIndex: number
): InvestigatorState {
  const card = state.cardsInHand[cardIndex]

  if (card == null) {
    throw new Error('Card not found in hand')
  }

  state.cardsInHand.splice(cardIndex, 1)
  state.discardPile.push(card)

  return state
}

export function play(
  state: InvestigatorState,
  cardIndex: number
): InvestigatorState {
  const card = state.cardsInHand[cardIndex]

  if (card == null) {
    throw new Error('Card not found in hand')
  }

  state.cardsInHand.splice(cardIndex, 1)
  state.cardsInPlay.push(card)

  return state
}

export function shuffle(state: InvestigatorState): InvestigatorState {
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

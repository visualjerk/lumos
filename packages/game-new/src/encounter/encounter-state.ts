import { EncounterCardId } from './encounter-card'
import { shuffleArray } from '../utils'

export function createInitialEncounterState(
  deck: EncounterCardId[]
): EncounterState {
  return new EncounterState(shuffleArray(deck), [])
}

export class EncounterState {
  constructor(
    public deck: EncounterCardId[],
    public discardPile: EncounterCardId[]
  ) {}

  draw(): EncounterCardId {
    if (this.deck.length === 0) {
      this.deck = this.discardPile
      this.discardPile = []
      this.shuffle()
    }

    if (this.deck.length === 0) {
      throw new Error('No encounter cards left')
    }

    return this.deck.pop()!
  }

  discard(cardId: EncounterCardId) {
    this.discardPile.push(cardId)
  }

  shuffle() {
    this.deck = shuffleArray(this.deck)
  }
}

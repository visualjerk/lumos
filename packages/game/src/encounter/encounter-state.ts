import { InvestigatorId } from '../investigator'
import { EncounterCardId } from './encounter-card'
import { shuffleArray } from '../utils'

export class EncounterState {
  constructor(
    public deck: EncounterCardId[],
    public discardPile: EncounterCardId[],
    public currentCardId: EncounterCardId | null,
    public investigatorId: InvestigatorId | null
  ) {}

  draw() {
    if (this.deck.length === 0) {
      this.deck = this.discardPile
      this.discardPile = []
      this.shuffle()
    }

    this.currentCardId = this.deck.pop()!
  }

  discardCurrent() {
    if (!this.currentCardId) {
      return
    }

    this.discardPile.push(this.currentCardId!)
    this.currentCardId = null
  }

  shuffle() {
    this.deck = shuffleArray(this.deck)
  }
}

export function createInitialEncounterState(
  deck: EncounterCardId[]
): EncounterState {
  return new EncounterState(shuffleArray(deck), [], null, null)
}

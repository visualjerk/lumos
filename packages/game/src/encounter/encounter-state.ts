import { InvestigatorId } from '../investigator'
import { EncounterCardId } from './encounter-card'
import { shuffleArray } from '../utils'
import { Context } from '../context'

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

    if (this.deck.length === 0) {
      throw new Error('No encounter cards left')
    }

    this.currentCardId = this.deck.pop()!
  }

  addToDiscardPile(cardId: EncounterCardId) {
    this.discardPile.push(cardId)
  }

  resetCurrent(context: Context) {
    if (this.currentCardId === null) {
      return
    }
    const encounterCard = context.getEncounterCard(
      context.encounterState.currentCardId!
    )

    if (encounterCard.type !== 'enemy') {
      this.discardPile.push(this.currentCardId!)
    }

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

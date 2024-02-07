import { getInvestigatorCard } from './investigator-card-collection'
import type { LocationId } from '../location'
import { shuffleArray } from '../utils'
import type { Investigator, InvestigatorId } from './investigator'
import type { InvestigatorCard, InvestigatorCardId } from './investigator-card'

export class InvestigatorState {
  constructor(
    public damage: number,
    public clues: number,
    public currentLocation: LocationId,
    public cardsInHand: InvestigatorCardId[],
    public cardsInPlay: InvestigatorCardId[],
    public deck: InvestigatorCardId[],
    public discardPile: InvestigatorCardId[]
  ) {}

  addDamage(amount: number) {
    this.damage += amount
  }

  canDraw(): boolean {
    return this.deck.length > 0 || this.discardPile.length > 0
  }

  draw() {
    if (!this.canDraw()) {
      return
    }

    if (this.deck.length === 0) {
      this.deck = this.discardPile
      this.discardPile = []
      this.shuffle()
    }

    this.cardsInHand.push(this.deck.pop()!)
  }

  discard(cardIndex: number) {
    const card = this.cardsInHand[cardIndex]

    if (card == null) {
      throw new Error('Card not found in hand')
    }

    this.cardsInHand.splice(cardIndex, 1)
    this.discardPile.push(card)
  }

  removeFromHand(cardIndex: number) {
    const card = this.cardsInHand[cardIndex]

    if (card == null) {
      throw new Error('Card not found in hand')
    }

    this.cardsInHand.splice(cardIndex, 1)
  }

  addToDiscardPile(cardId: InvestigatorCardId) {
    this.discardPile.push(cardId)
  }

  play(cardIndex: number) {
    const card = this.cardsInHand[cardIndex]

    if (card == null) {
      throw new Error('Card not found in hand')
    }

    this.cardsInHand.splice(cardIndex, 1)
    this.cardsInPlay.push(card)
  }

  shuffle() {
    this.deck = shuffleArray(this.deck)
  }

  getCardsInHand(): InvestigatorCard[] {
    return this.cardsInHand.map((cardId) => getInvestigatorCard(cardId))
  }

  getCardsInPlay(): InvestigatorCard[] {
    return this.cardsInPlay.map((cardId) => getInvestigatorCard(cardId))
  }
}

function createInitialInvestigatorState(
  investigator: Investigator,
  currentLocation: LocationId
): InvestigatorState {
  return new InvestigatorState(
    0,
    0,
    currentLocation,
    [],
    [],
    shuffleArray(investigator.baseDeck),
    []
  )
}

export class InvestigatorStates extends Map<InvestigatorId, InvestigatorState> {
  constructor(investigators: Investigator[], currentLocation: LocationId) {
    super(
      investigators.map((investigator) => [
        investigator.id,
        createInitialInvestigatorState(investigator, currentLocation),
      ])
    )
  }
}

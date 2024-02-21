import { getInvestigatorCard } from './investigator-card-collection'
import { LocationId } from '../location'
import { Investigator, InvestigatorId } from './investigator'
import { InvestigatorCard, InvestigatorCardId } from './investigator-card'
import { shuffleArray } from '../utils'

export type InvestigatorStateProps = {
  damage: number
  clues: number
  currentLocation: LocationId
  cardsInHand: InvestigatorCardId[]
  cardsInPlay: InvestigatorCardId[]
  deck: InvestigatorCardId[]
  discardPile: InvestigatorCardId[]
}

export class InvestigatorState implements InvestigatorStateProps {
  constructor(
    public health: number,
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

  removeDamage(amount: number) {
    this.damage = Math.max(this.damage - amount, 0)
  }

  isDefeated(): boolean {
    return this.damage >= this.health
  }

  canDraw(): boolean {
    return this.deck.length > 0 || this.discardPile.length > 0
  }

  draw(count = 1) {
    for (let i = 0; i < count; i++) {
      this.drawOne()
    }
  }

  private drawOne() {
    if (!this.canDraw()) {
      return
    }

    if (this.deck.length === 0) {
      this.deck = this.discardPile
      this.discardPile = []
      this.shuffle()
    }

    if (this.deck.length === 0) {
      throw new Error('No cards left')
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
    investigator.health,
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
  allDefeated(): boolean {
    return [...this.values()].every((state) => state.isDefeated())
  }
}

export function createInitialInvestigatorStates(
  investigators: Investigator[],
  currentLocation: LocationId
): InvestigatorStates {
  return new InvestigatorStates(
    investigators.map((investigator) => [
      investigator.id,
      createInitialInvestigatorState(investigator, currentLocation),
    ])
  )
}

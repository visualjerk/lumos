import { EncounterCardId } from '..'
import { LocationId } from '../../location'
import { EnemyCard } from './enemy-card'

export class EnemyState {
  constructor(
    public cardId: EncounterCardId,
    public health: number,
    public strength: number,
    public damage: number,
    public location: LocationId
  ) {}

  addDamage(amount: number) {
    this.damage += amount
  }

  isDead(): boolean {
    return this.health <= 0
  }
}

function createInitialEnemyState(
  card: EnemyCard,
  location: LocationId
): EnemyState {
  return new EnemyState(card.id, card.health, card.strength, 0, location)
}

export class EnemyStates extends Array<EnemyState> {
  add(card: EnemyCard, location: LocationId) {
    this.push(createInitialEnemyState(card, location))
  }
}

export function createInitialEnemyStates() {
  return new EnemyStates()
}

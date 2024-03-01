import { InvestigatorId } from '../investigator'
import { EncounterCardId } from '../encounter'
import { LocationId } from '../location'
import { EnemyCard } from './enemy-card'

export type EnemyStateProps = {
  cardId: EncounterCardId
  health: number
  strength: number
  damage: number
  location: LocationId
  engagedInvestigator: InvestigatorId | null
}

export class EnemyState implements EnemyStateProps {
  constructor(
    public cardId: EncounterCardId,
    public health: number,
    public strength: number,
    public attackDamage: number,
    public damage: number,
    public location: LocationId,
    public engagedInvestigator: InvestigatorId | null = null
  ) {}

  addDamage(amount: number) {
    this.damage += amount
  }

  isDefeated(): boolean {
    return this.health <= this.damage
  }
}

function createInitialEnemyState(
  card: EnemyCard,
  location: LocationId,
  engagedInvestigator: InvestigatorId | null = null
): EnemyState {
  return new EnemyState(
    card.id,
    card.health,
    card.strength,
    card.attackDamage,
    0,
    location,
    engagedInvestigator
  )
}

export class EnemyStates extends Array<EnemyState> {
  add(
    card: EnemyCard,
    location: LocationId,
    engagedInvestigator: InvestigatorId | null = null
  ) {
    this.push(createInitialEnemyState(card, location, engagedInvestigator))
  }

  remove(enemy: EnemyState) {
    const index = this.indexOf(enemy)
    this.splice(index, 1)
  }
}

export function createInitialEnemyStates() {
  return new EnemyStates()
}

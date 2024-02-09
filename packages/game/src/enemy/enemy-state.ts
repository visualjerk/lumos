import { Context } from '../context'
import { InvestigatorId } from '../investigator'
import { EncounterCardId } from '../encounter'
import { LocationId } from '../location'
import { EnemyCard } from './enemy-card'

export type EnemyStateProps = {
  cardId: EncounterCardId
  health: number
  strength: number
  damage: number
  ready: boolean
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
    public ready: boolean = true,
    public location: LocationId,
    public engagedInvestigator: InvestigatorId | null = null
  ) {}

  addDamage(context: Context, amount: number) {
    this.damage += amount

    if (this.isDefeated()) {
      context.encounterState.addToDiscardPile(this.cardId)
      context.enemyStates.remove(this)
    }
  }

  isDefeated(): boolean {
    return this.damage >= this.health
  }

  attackEnganged(context: Context) {
    if (!this.engagedInvestigator) {
      return
    }
    const investigatorState = context.getInvestigatorState(
      this.engagedInvestigator
    )
    investigatorState.addDamage(this.attackDamage)
    this.ready = false
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
    true,
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
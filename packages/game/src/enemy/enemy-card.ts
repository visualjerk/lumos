import { EncounterCardBase } from '..'

export type EnemyCard = EncounterCardBase & {
  type: 'enemy'
  health: number
  attackDamage: number
  strength: number
}

import { EncounterCardBase } from '..'

export type EnemyCard = EncounterCardBase & {
  type: 'enemy'
  health: number
  damage: number
  strength: number
}

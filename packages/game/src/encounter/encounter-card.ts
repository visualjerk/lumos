import { Effect } from '../effect'
import { EnemyCard } from '../enemy'

export type EncounterCardId = `ec-${string}`

export type EncounterCardBase = {
  id: EncounterCardId
  name: string
  description: string
}

export type TrapCard = EncounterCardBase & {
  type: 'trap'
  effect: Effect
}

export type EncounterCard = TrapCard | EnemyCard

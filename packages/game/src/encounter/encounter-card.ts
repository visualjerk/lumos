import { Effect, SkillCheck } from '../skill-check'
import { EnemyCard } from '../enemy'

export type EncounterCardId = string

export type EncounterCardBase = {
  id: EncounterCardId
  name: string
  description: string
}

export type TrapCard = EncounterCardBase & {
  type: 'trap'
  effect?: Effect
  skillCheck?: SkillCheck
}

export type EncounterCard = TrapCard | EnemyCard

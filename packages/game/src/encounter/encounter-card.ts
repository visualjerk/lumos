import { Effect, SkillCheck } from '../skill-check'

export type EncounterCardId = string

export type EncounterCard = {
  id: EncounterCardId
  name: string
  description: string
  effect?: Effect
  skillCheck?: SkillCheck
}

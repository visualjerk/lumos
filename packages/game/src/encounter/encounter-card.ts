import { Skills } from '..'
import { Context } from '../context'

export type EncounterCardId = string

export type SkillCheck = {
  skill: keyof Skills
  difficulty: number
  onSuccess: Effect
  onFailure: Effect
}

export type Effect = {
  apply: (context: Context) => Context
}

export type EncounterCard = {
  id: EncounterCardId
  name: string
  effect?: Effect
  skillCheck?: SkillCheck
}

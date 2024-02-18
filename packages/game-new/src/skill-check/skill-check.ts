import { Context, InvestigatorId, LocationId, Skills } from '@lumos/game'
import { Fate } from '../fate'

export type SkillCheckContext = {
  check: SkillCheck
  difficulty: number
  totalSkill: number
  fate: Fate
}

export type SkillCheck = {
  skill: keyof Skills
  difficulty:
    | number
    | ((context: Context, effectContext: EffectContext) => number)
  onSuccess: Effect
  onFailure: Effect
}

export type EffectContext = {
  investigatorId: InvestigatorId
  locationId: LocationId
}

export type Effect = {
  apply: (context: Context, effectContext: EffectContext) => Context
}

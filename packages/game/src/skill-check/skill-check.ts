import { Context } from '../context'
import { InvestigatorId, Skills } from '../investigator'

export type SkillCheck = {
  skill: keyof Skills
  difficulty: number
  onSuccess: Effect
  onFailure: Effect
}

export type EffectContext = {
  investigatorId: InvestigatorId
}

export type Effect = {
  apply: (context: Context, effectContext: EffectContext) => Context
}

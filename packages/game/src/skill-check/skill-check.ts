import { LocationId } from '../location'
import { Context } from '../context'
import { InvestigatorId, Skills } from '../investigator'

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

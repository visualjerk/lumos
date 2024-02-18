import { Context, InvestigatorId, Skills } from '@lumos/game'

export type SkillCheckContext = {
  check: SkillCheck
}

export type SkillCheck = {
  skill: keyof Skills
  investigatorId: InvestigatorId
  difficulty: number
  onSuccess: Effect
  onFailure: Effect
}

export type Effect = {
  apply: (context: Context) => Context
}

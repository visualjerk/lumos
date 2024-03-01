import { Effect } from '../effect'
import { InvestigatorCardId, InvestigatorId, Skills } from '../investigator'

export type SkillCheckContext = {
  check: SkillCheck
  skillModifier: number
  addedCards: InvestigatorCardId[]
}

export type SkillCheck = {
  skill: keyof Skills
  investigatorId: InvestigatorId
  difficulty: number
  onSuccess?: Effect
  onFailure?: Effect
}

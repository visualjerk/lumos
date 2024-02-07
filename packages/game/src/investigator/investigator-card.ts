import { Effect, SkillCheck } from '../skill-check'
import { Skills } from './investigator'

export type InvestigatorCardId = string

export type InvestigatorCardBase = {
  id: InvestigatorCardId
  name: string
  skillModifier: Partial<Skills>
  description: string
}

export type SkillCard = InvestigatorCardBase & {
  type: 'skill'
}

export type PermanentCard = InvestigatorCardBase & {
  type: 'permanent'
  permanentSkillModifier: Partial<Skills>
}

export type EffectCard = InvestigatorCardBase & {
  type: 'effect'
  effect?: Effect
  skillCheck?: SkillCheck
}

export type InvestigatorCard = SkillCard | PermanentCard | EffectCard

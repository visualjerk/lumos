import { Effect } from '../effect'
import { Skills } from './investigator'

export type InvestigatorCardId = `ic-${string}`

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

export type ActionCard = InvestigatorCardBase & {
  type: 'action'
  effect: Effect
}

export type InvestigatorCard = SkillCard | PermanentCard | ActionCard

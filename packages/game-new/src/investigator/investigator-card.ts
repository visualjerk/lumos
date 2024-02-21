import { Action } from '../action'
import { Skills } from './investigator'

export type InvestigatorCardId = `ic${number}`

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
  action: Action
}

export type InvestigatorCard = SkillCard | PermanentCard | ActionCard

import { Skills } from './investigator'

export type InvestigatorCardId = string

export type InvestigatorCard = {
  id: InvestigatorCardId
  name: string
  skillModifier: Partial<Skills>
  permanentSkillModifier?: Partial<Skills>
}

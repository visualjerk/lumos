import type { InvestigatorCardId } from './investigator-card'

export type InvestigatorId = string

export type Skills = {
  intelligence: number
  strength: number
  agility: number
}

export type Investigator = {
  id: InvestigatorId
  name: string
  baseSkills: Skills
  health: number
  baseDeck: InvestigatorCardId[]
}

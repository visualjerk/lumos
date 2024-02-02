export type InvestigatorId = string

export type BaseStats = {
  strength: number
  intelligence: number
  agility: number
}

export type Investigator = {
  id: InvestigatorId
  name: string
  baseStats: BaseStats
  health: number
}

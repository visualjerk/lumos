export type InvestigatorId = string

export type BaseStats = {
  strength: number
  intelligence: number
  agility: number
}

export type InvestigatorCard = {
  id: InvestigatorId
  name: string
  baseStats: BaseStats
  health: number
}

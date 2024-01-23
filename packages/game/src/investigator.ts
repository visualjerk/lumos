export type BaseStats = {
  strength: number
  intelligence: number
  agility: number
}

export type Investigator = {
  name: string
  baseStats: BaseStats
  health: number
}

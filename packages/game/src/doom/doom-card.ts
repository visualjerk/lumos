export type DoomCardId = string

export type DoomCard = {
  id: DoomCardId
  name: string
  story: string
  treshold: number
  consequence: string
  nextDoomCardId?: DoomCardId
}

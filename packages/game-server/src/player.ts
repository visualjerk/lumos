export type PlayerId = string

export type Player = {
  id: PlayerId
}

export type PlayerRepository = {
  findById(id: PlayerId): Promise<Player | null>
  create(player: Player): Promise<void>
}

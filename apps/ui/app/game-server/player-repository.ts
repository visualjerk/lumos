import { Player, PlayerRepository } from '@lumos/game-server'

// TODO: Use a real database
const Players = new Map<string, Player>()

export function createPlayerRepository(): PlayerRepository {
  return {
    async create(player: Player): Promise<void> {
      Players.set(player.id, player)
    },

    async findById(id: string): Promise<Player | undefined> {
      return Players.get(id)
    },
  }
}

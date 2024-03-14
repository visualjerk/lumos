import { kv } from '@vercel/kv'
import { PlayerRepository } from '@lumos/game-server'

export function createPlayerRepository(): PlayerRepository {
  return {
    async create(player) {
      await kv.set(player.id, player)
      return player
    },

    async findById(id) {
      return kv.get(id)
    },
  }
}

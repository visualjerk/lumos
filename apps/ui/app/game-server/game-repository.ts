import { kv } from '@vercel/kv'
import { SavedGame, GameRepository } from '@lumos/game-server'

export function createGameRepository(): GameRepository {
  return {
    async create(game) {
      await kv.set(game.id, game)
      return game
    },
    async findById(id) {
      return kv.get(id)
    },
    async update(id, gameData) {
      const game = (await kv.get(id)) as SavedGame

      if (!game) {
        throw new Error(`Game not found: ${id}`)
      }

      const updatedGame = { ...game, ...gameData }

      await kv.set(id, updatedGame)

      return updatedGame
    },
  }
}

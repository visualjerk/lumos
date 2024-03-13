import { Game, GameRepository } from '@lumos/game-server'

// TODO: Use a real database
const Games = new Map<string, Game>()

export function createGameRepository(): GameRepository {
  return {
    async create(game) {
      Games.set(game.id, game)
    },
    async findById(id) {
      return Games.get(id)
    },
    async update(id, gameData) {
      const game = Games.get(id)

      if (!game) {
        throw new Error(`Game not found: ${id}`)
      }

      Games.set(id, { ...game, ...gameData })
    },
  }
}

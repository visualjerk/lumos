'use server'
import { getGameServer } from '@/game-server'
import { CreateGameData, Game } from '@lumos/game-server'

export async function createGame(
  createGameData: CreateGameData
): Promise<Game> {
  const gameServer = getGameServer()
  return await gameServer.createGame(createGameData)
}

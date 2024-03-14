'use server'
import { getGameServer } from '@/game-server'
import { CreateGameData, SavedGame } from '@lumos/game-server'

export async function createGame(
  createGameData: CreateGameData
): Promise<SavedGame> {
  const gameServer = getGameServer()
  return await gameServer.createGame(createGameData)
}

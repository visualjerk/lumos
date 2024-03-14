'use server'
import { getGameServer } from '@/game-server'
import { SavedGame, GameId } from '@lumos/game-server'

export async function getSavedGame(id: GameId): Promise<SavedGame | null> {
  const gameServer = getGameServer()
  return await gameServer.findGame(id)
}

export async function performAction(id: GameId, index: number) {
  const gameServer = getGameServer()
  return await gameServer.performAction(id, index)
}

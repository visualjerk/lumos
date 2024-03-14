'use server'
import { getGameServer } from '@/game-server'
import { SavedGame, GameId, PlayerId } from '@lumos/game-server'

export async function getSavedGame(id: GameId): Promise<SavedGame | null> {
  const gameServer = getGameServer()
  return await gameServer.findGame(id)
}

export async function performAction(
  playerId: PlayerId,
  gameId: GameId,
  index: number
): Promise<SavedGame> {
  const gameServer = getGameServer()
  return await gameServer.performAction({ playerId, gameId, index })
}

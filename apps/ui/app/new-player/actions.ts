'use server'
import { getGameServer } from '@/game-server'
import { Player } from '@lumos/game-server'

export async function createPlayer(): Promise<Player> {
  const gameServer = getGameServer()
  return await gameServer.createPlayer()
}

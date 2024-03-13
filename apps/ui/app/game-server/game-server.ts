import { GameServer } from '@lumos/game-server'
import { createGameRepository } from './game-repository'
import { createPlayerRepository } from './player-repository'

export function getGameServer(): GameServer {
  return new GameServer(createGameRepository(), createPlayerRepository())
}

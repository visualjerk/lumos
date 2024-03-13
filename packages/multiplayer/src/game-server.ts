import { InvestigatorId, ScenarioId } from '@lumos/game'
import { Game, GameId, GameRepository } from './game'
import { Player, PlayerId, PlayerRepository } from './player'
import { v4 as uuid } from 'uuid'

export type CreateGameData = {
  playerId: PlayerId
  scenarioId: ScenarioId
  investigatorId: InvestigatorId
}

export type JoinGameData = {
  gameId: GameId
  playerId: PlayerId
  investigatorId: InvestigatorId
}

export class GameServer {
  constructor(
    private gameRepository: GameRepository,
    private playerRepository: PlayerRepository
  ) {}

  async createPlayer(): Promise<Player> {
    const player = { id: uuid() }
    await this.playerRepository.create(player)

    return player
  }

  async createGame({
    playerId,
    scenarioId,
    investigatorId,
  }: CreateGameData): Promise<Game> {
    await this.ensurePlayerExists(playerId)

    const game: Game = {
      id: uuid(),
      ownerId: playerId,
      playerIds: [playerId],
      investigatorIds: [investigatorId],
      scenarioId,
      history: [],
      seed: uuid(),
    }

    await this.gameRepository.create(game)

    return game
  }

  async joinGame({
    playerId,
    gameId,
    investigatorId,
  }: JoinGameData): Promise<void> {
    await this.ensurePlayerExists(playerId)
    const game = await this.getGame(gameId)

    if (game.playerIds.includes(playerId)) {
      throw new Error('Player already in game')
    }

    await this.gameRepository.update(gameId, {
      playerIds: [...game.playerIds, playerId],
      investigatorIds: [...game.investigatorIds, investigatorId],
    })
  }

  async findGame(gameId: GameId): Promise<Game | undefined> {
    return this.gameRepository.findById(gameId)
  }

  private async ensurePlayerExists(playerId: PlayerId): Promise<void> {
    const player = await this.playerRepository.findById(playerId)

    if (!player) {
      throw new Error('Player not found')
    }
  }

  private async getGame(gameId: GameId): Promise<Game> {
    const game = await this.gameRepository.findById(gameId)

    if (!game) {
      throw new Error('Game not found')
    }

    return game
  }
}

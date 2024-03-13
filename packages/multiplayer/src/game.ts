import { GameHistory, InvestigatorId, ScenarioId } from '@lumos/game'
import { PlayerId } from './player'

export type GameId = string

export type Game = {
  id: GameId
  ownerId: PlayerId
  playerIds: PlayerId[]
  investigatorIds: InvestigatorId[]
  scenarioId: ScenarioId
  history: GameHistory
  seed: string
}

export type GameUpdateData = Partial<Omit<Game, 'id'>>

export type GameRepository = {
  findById(id: GameId): Promise<Game | undefined>
  create(game: Game): Promise<void>
  update(id: GameId, gameData: GameUpdateData): Promise<void>
}

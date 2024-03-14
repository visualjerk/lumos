import { GameHistory, InvestigatorId, ScenarioId } from '@lumos/game'
import { PlayerId } from './player'

export type GameId = string

export type SavedGame = {
  id: GameId
  ownerId: PlayerId
  playerIds: PlayerId[]
  investigatorIds: InvestigatorId[]
  scenarioId: ScenarioId
  history: GameHistory
  seed: string
}

export type GameUpdateData = Partial<Omit<SavedGame, 'id'>>

export type GameRepository = {
  findById(id: GameId): Promise<SavedGame | null>
  create(game: SavedGame): Promise<void>
  update(id: GameId, gameData: GameUpdateData): Promise<void>
}

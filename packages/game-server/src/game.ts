import {
  GameHistory,
  Investigator,
  InvestigatorCollection,
  InvestigatorId,
  PublicGame,
  ScenarioId,
  createPublicGame,
} from '@lumos/game'
import { PlayerId } from './player'
import { ScenarioCollection } from '@lumos/scenarios'

export type GameId = string

export type SavedGame = {
  id: GameId
  ownerId: PlayerId
  playerIds: PlayerId[]
  investigatorIds: InvestigatorId[]
  scenarioId: ScenarioId
  history: GameHistory
  seed: number
}

export type GameUpdateData = Partial<Omit<SavedGame, 'id'>>

export type GameRepository = {
  findById(id: GameId): Promise<SavedGame | null>
  create(game: SavedGame): Promise<SavedGame>
  update(id: GameId, gameData: GameUpdateData): Promise<SavedGame>
}

export function createGameFromSavedGame(savedGame: SavedGame): PublicGame {
  const scenario = ScenarioCollection.get(savedGame.scenarioId)

  if (!scenario) {
    throw new Error(`Scenario ${savedGame.scenarioId} not found`)
  }

  const investigators: Investigator[] = []

  for (const id of savedGame.investigatorIds) {
    const investigator = InvestigatorCollection.get(id)

    if (!investigator) {
      throw new Error(`Investigator ${id} not found`)
    }

    investigators.push(investigator)
  }
  return createPublicGame(
    scenario,
    investigators,
    savedGame.history,
    savedGame.seed
  )
}

export function getInvestigatorIdFromSavedGame(
  savedGame: SavedGame,
  playerId: PlayerId
): InvestigatorId {
  const index = savedGame.playerIds.indexOf(playerId)
  const investigatorId = savedGame.investigatorIds[index]

  if (!investigatorId) {
    throw new Error(`Investigator not found for player ${playerId}`)
  }

  return investigatorId
}

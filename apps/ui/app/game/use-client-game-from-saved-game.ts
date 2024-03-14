import { Investigator, InvestigatorCollection } from '@lumos/game'
import { SavedGame, PlayerId } from '@lumos/game-server'
import { ScenarioCollection } from '@lumos/scenarios'
import { useClientGame } from './use-client-game'

export function useClientGameFromSavedGame(
  savedGame: SavedGame,
  playerId: PlayerId
) {
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

  const investigatorIndex = savedGame.playerIds.indexOf(playerId)
  const investigatorId = savedGame.investigatorIds[investigatorIndex]

  return useClientGame(scenario, investigators, investigatorId)
}

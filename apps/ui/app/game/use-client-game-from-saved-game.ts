import {
  SavedGame,
  PlayerId,
  createGameFromSavedGame,
  getInvestigatorIdFromSavedGame,
} from '@lumos/game-server'
import { useClientGame } from './use-client-game'
import { useMemo } from 'react'

export function useClientGameFromSavedGame(
  savedGame: SavedGame,
  playerId: PlayerId
) {
  const game = useMemo(() => createGameFromSavedGame(savedGame), [savedGame])
  const investigatorId = useMemo(
    () => getInvestigatorIdFromSavedGame(savedGame, playerId),
    [savedGame, playerId]
  )

  return useClientGame(game, investigatorId)
}

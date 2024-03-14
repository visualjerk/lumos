'use client'
import GameUI from '@/game/game-ui'

import { GameProvider } from '../use-game'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getSavedGame } from './actions'
import { SavedGame, PlayerId } from '@lumos/game-server'
import { useAuth } from '@/auth'
import { useClientGameFromSavedGame } from '../use-client-game-from-saved-game'

export default function Game() {
  const { playerId } = useAuth()
  const params = useParams<{ id: string }>()
  const gameId = params.id
  const [savedGame, setSavedGame] = useState<SavedGame | null>(null)

  useEffect(() => {
    async function loadGame() {
      const game = await getSavedGame(gameId)
      setSavedGame(game)
    }
    loadGame()
  }, [gameId])

  return (
    <main>
      {!savedGame || !playerId ? (
        <div>Loading game ...</div>
      ) : (
        <GameContent game={savedGame} playerId={playerId} />
      )}
    </main>
  )
}

type GameContentProps = {
  game: SavedGame
  playerId: PlayerId
}

function GameContent({ game, playerId }: GameContentProps) {
  const initialGame = useClientGameFromSavedGame(game, playerId)

  return (
    <main>
      <GameProvider game={initialGame}>
        <div className="h-screen">
          <GameUI />
        </div>
      </GameProvider>
    </main>
  )
}

'use client'
import GameUI from '@/game/game-ui'

import { GameProvider } from '../use-game'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getSavedGame, performAction } from './actions'
import { SavedGame, PlayerId } from '@lumos/game-server'
import { useAuth } from '@/auth'
import { useClientGameFromSavedGame } from '../use-client-game-from-saved-game'
import { HandleGameAction } from '..'

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

  async function executeAction(index: number) {
    if (!playerId || !gameId) {
      return
    }
    const newGame = await performAction(playerId, gameId, index)
    setSavedGame(newGame)
  }

  return (
    <main>
      {!savedGame || !playerId ? (
        <div>Loading game ...</div>
      ) : (
        <GameContent
          game={savedGame}
          playerId={playerId}
          onAction={executeAction}
        />
      )}
    </main>
  )
}

type GameContentProps = {
  game: SavedGame
  playerId: PlayerId
  onAction: HandleGameAction
}

function GameContent({ game, playerId, onAction }: GameContentProps) {
  const initialGame = useClientGameFromSavedGame(game, playerId, onAction)

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

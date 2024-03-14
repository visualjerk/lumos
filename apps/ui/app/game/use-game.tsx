'use client'
import { createContext, useContext } from 'react'
import { ClientGame } from './use-client-game'

const GameContext = createContext<ClientGame | null>(null)

export type GameProviderProps = {
  children: React.ReactNode
  game: ClientGame
}

export function GameProvider({ children, game }: GameProviderProps) {
  return <GameContext.Provider value={game}>{children}</GameContext.Provider>
}

export function useGame(): ClientGame {
  const game = useContext(GameContext)
  if (!game) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return game
}

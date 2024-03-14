'use client'
import { createContext, useContext } from 'react'
import { ProjectedGame } from './use-client-game'

const GameContext = createContext<ProjectedGame | null>(null)

export type GameProviderProps = {
  children: React.ReactNode
  game: ProjectedGame
}

export function GameProvider({ children, game }: GameProviderProps) {
  return <GameContext.Provider value={game}>{children}</GameContext.Provider>
}

export function useGame(): ProjectedGame {
  const game = useContext(GameContext)
  if (!game) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return game
}

import { createContext, useContext } from 'react'
import { ProjectedGame } from './use-initial-game'

const GameContext = createContext<ProjectedGame | null>(null)

export function GameProvider({
  children,
  game,
}: {
  children: React.ReactNode
  game: ProjectedGame
}) {
  return <GameContext.Provider value={game}>{children}</GameContext.Provider>
}

export function useGame() {
  const game = useContext(GameContext)
  if (!game) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return game
}

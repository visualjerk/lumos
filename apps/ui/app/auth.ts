'use client'

import { PlayerId } from '@lumos/game-server'
import { useLocalStorage } from 'react-use'

const PLAYER_ID_KEY = 'Lumos.PlayerId'

export function useAuth() {
  const [playerId, setPlayerId] = useLocalStorage<PlayerId>(PLAYER_ID_KEY)

  return {
    isAuthenticated: !!playerId,
    setPlayerId,
    playerId,
  }
}

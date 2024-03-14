'use client'

import { PlayerId } from '@lumos/game-server'
import { useMemo } from 'react'
import { useLocalStorage } from 'react-use'

const PLAYER_ID_KEY = 'Lumos.PlayerId'

export function useAuth() {
  const [playerId, setPlayerId] = useLocalStorage<PlayerId>(PLAYER_ID_KEY)

  const isAuthenticated = useMemo(() => !!playerId, [playerId])

  return {
    isAuthenticated,
    setPlayerId,
    playerId,
  }
}

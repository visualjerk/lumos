'use client'
const PLAYER_ID_KEY = 'Lumos.PlayerId'

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  return !!localStorage.getItem(PLAYER_ID_KEY)
}

export function getPlayerId(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  return localStorage.getItem(PLAYER_ID_KEY)
}

export function setPlayerId(playerId: string): void {
  if (typeof window === 'undefined') {
    return
  }
  localStorage.setItem(PLAYER_ID_KEY, playerId)
}

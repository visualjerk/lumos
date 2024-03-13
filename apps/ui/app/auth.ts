'use client'
const PLAYER_ID_KEY = 'Lumos.PlayerId'

export function isAuthenticated(): boolean {
  return !!localStorage.getItem(PLAYER_ID_KEY)
}

export function getPlayerId(): string | null {
  return localStorage.getItem(PLAYER_ID_KEY)
}

export function setPlayerId(playerId: string): void {
  localStorage.setItem(PLAYER_ID_KEY, playerId)
}

'use client'

import { Attribute } from './attribute'

export type GameIconKind = Attribute

export type GameIconProps = {
  kind: GameIconKind
} & React.HTMLAttributes<HTMLSpanElement>

const GAME_ICONS: Record<GameIconKind, string> = {
  agility: '🏃🏽‍♂️',
  strength: '💪',
  intelligence: '🧠',
  health: '❤️',
  clues: '🔮',
  damage: '💢',
}

export default function GameIcon({ kind, ...attributes }: GameIconProps) {
  return <span {...attributes}>{GAME_ICONS[kind]}</span>
}

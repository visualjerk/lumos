import Artwork from '@/shared/artwork'
import { EnemyCard } from '@lumos/game'

export type EnemyTokenProps = {
  card: EnemyCard
}

export function EnemyToken({ card }: EnemyTokenProps) {
  return (
    <Artwork
      id={card.id}
      className="w-12 h-12 rounded-full object-cover border-2 border-red-800 shadow-sm"
    />
  )
}

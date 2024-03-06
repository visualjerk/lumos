import { EnemyCard } from '@lumos/game'
import Artwork from '@/shared/artwork'
import { AttributeItem } from '@/shared/attribute-item'

export type EnemyCardProps = {
  card: EnemyCard
}

export function EnemyCard({ card }: EnemyCardProps) {
  return (
    <div className="relative rounded border-2 shadow w-40 h-60 text-stone-800 bg-stone-300 border-stone-600">
      <Artwork
        id="bg-card"
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />
      <div className="relative">
        <h3 className="p-2 leading-none">{card.name}</h3>
        <div className="relative">
          <Artwork id={card.id} className="object-cover w-full aspect-video" />
        </div>
        <div className="p-2 flex gap-4">
          <AttributeItem attribute="health" value={card.health} />
          <AttributeItem attribute="strength" value={card.strength} />
          <AttributeItem attribute="damage" value={card.attackDamage} />
        </div>
        <div className="p-2">
          <div className="text-xs">{card.description}</div>
        </div>
      </div>
    </div>
  )
}

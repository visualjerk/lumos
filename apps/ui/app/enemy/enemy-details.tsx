import { useGame } from '@/game'
import { EnemyCard, getEncounterCard } from '@lumos/game'
import { EnemyCard as EnemyCardComp } from '.'
import Artwork from '@/shared/artwork'
import { AttributeItem } from '@/shared/attribute-item'

export type EnemyDetailsProps = {
  enemyIndex: number
}

export function EnemyDetails({ enemyIndex }: EnemyDetailsProps) {
  const { context } = useGame()
  const state = context.getEnemyState(enemyIndex)
  const card = getEncounterCard(state.cardId) as EnemyCard

  return (
    <div className="relative bg-stone-500 border-2 rounded border-stone-700 shadow-lg">
      <Artwork
        id="bg-stone"
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />
      <div className="relative grid gap-3 p-4 text-stone-100">
        <div className="flex justify-center">
          <EnemyCardComp card={card} />
        </div>
        <div className="flex justify-center gap-2 bg-stone-700 p-1 px-2 rounded-full">
          <AttributeItem attribute="health" value={state.health} />
          <AttributeItem attribute="damage" value={state.damage} />
        </div>
      </div>
    </div>
  )
}

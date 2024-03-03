import { useGame } from '@/game'
import Artwork from '@/shared/artwork'
import { AttributeItem } from '@/shared/attribute-item'
import { cn } from '@/utils'
import { LocationId, getEncounterCard, getMatchingAction } from '@lumos/game'

export function LocationCard({ id }: { id: LocationId }) {
  const { context, actions } = useGame()
  const card = context.getLocation(id)
  const state = context.getLocationState(id)
  const { clues, revealed } = state

  const investigators = context.getLocationInvestigators(id)
  const enemyIndexes = context.getLocationEnemies(id)
  const enemies = enemyIndexes.map((index) => {
    const enemyState = context.getEnemyState(index)
    const enemyCard = getEncounterCard(enemyState.cardId)

    return enemyCard
  })

  const action = getMatchingAction(actions, [
    {
      type: 'move',
      locationId: id,
    },
    {
      type: 'investigate',
      locationId: id,
    },
  ])

  return (
    <div
      className={cn(
        'relative rounded border shadow w-40 h-40 text-stone-800',
        action
          ? 'cursor-pointer outline outline-blue-400 bg-blue-50 border-blue-300'
          : 'bg-stone-300 border-stone-400'
      )}
      onClick={action?.execute}
    >
      <h3 className="p-2 leading-none">{card.name}</h3>
      <div className="relative">
        <Artwork id={id} className="object-cover w-full h-16" />
      </div>
      {revealed && (
        <div className="p-2 flex justify-between">
          <AttributeItem attribute="shroud" value={card.shroud} />
          <AttributeItem attribute="clues" value={clues} />
        </div>
      )}
      <div className="absolute -bottom-4 -left-4 -right-4 flex gap-4 justify-between">
        <div className="flex gap-2">
          {enemies.map((enemy) => (
            <Artwork
              key={enemy.id}
              id={enemy.id}
              className="w-12 h-12 rounded-full object-cover border-2 border-stone-400 shadow-sm"
            />
          ))}
        </div>
        <div className="flex gap-2">
          {investigators.map((investigator) => (
            <Artwork
              key={investigator.id}
              id={investigator.id}
              className="w-12 h-12 rounded-full object-cover border-2 border-stone-400 shadow-sm"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

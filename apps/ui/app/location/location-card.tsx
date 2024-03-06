import { EnemyToken } from '@/enemy'
import { useGame } from '@/game'
import { InvestigatorToken } from '@/investigator'
import Artwork from '@/shared/artwork'
import { AttributeItem } from '@/shared/attribute-item'
import { cn } from '@/utils'
import {
  EnemyCard,
  LocationId,
  getEncounterCard,
  getMatchingAction,
} from '@lumos/game'

export function LocationCard({ id }: { id: LocationId }) {
  const { context, actions } = useGame()
  const card = context.getLocation(id)
  const state = context.getLocationState(id)
  const { clues, revealed } = state

  const investigators = context.getLocationInvestigators(id)
  const enemyIndexes = context.getLocationEnemies(id)

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
        'relative rounded border-2 shadow w-40 h-40 text-stone-800',
        action
          ? 'cursor-pointer outline outline-blue-400 bg-blue-200 border-blue-400'
          : 'bg-stone-300 border-stone-600'
      )}
      onClick={action?.execute}
    >
      <Artwork
        id="bg-card"
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />
      <div className="relative">
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
      </div>
      <div className="absolute -bottom-4 -left-4 -right-4 flex gap-4 justify-between">
        <div className="flex gap-2">
          {enemyIndexes.map((index) => (
            <EnemyToken key={index} enemyIndex={index} />
          ))}
        </div>
        <div className="flex gap-2">
          {investigators.map((investigator) => (
            <InvestigatorToken
              key={investigator.id}
              investigator={investigator}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

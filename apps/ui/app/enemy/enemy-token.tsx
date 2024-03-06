import { useGame } from '@/game'
import Artwork from '@/shared/artwork'
import { cn } from '@/utils'
import { EnemyCard, getEncounterCard, getMatchingAction } from '@lumos/game'

export type EnemyTokenProps = {
  enemyIndex: number
}

export function EnemyToken({ enemyIndex }: EnemyTokenProps) {
  const { context, actions } = useGame()
  const state = context.getEnemyState(enemyIndex)
  const card = getEncounterCard(state.cardId) as EnemyCard

  const action = getMatchingAction(actions, [
    {
      type: 'attack',
      enemyIndex,
    },
  ])

  return (
    <div
      className={cn('relative flex justify-center', action && 'cursor-pointer')}
      onClickCapture={action?.execute}
    >
      <div className="absolute bottom-0 -right-1">
        <div className="px-1 bg-red-800 rounded-full text-white flex items-center justify-center">
          {state.health - state.damage}
        </div>
      </div>
      <Artwork
        id={card.id}
        className={cn(
          'w-12 h-12 rounded-full object-cover border-2 border-red-800 shadow-sm',
          action && 'outline outline-blue-400 border-blue-400'
        )}
      />
    </div>
  )
}

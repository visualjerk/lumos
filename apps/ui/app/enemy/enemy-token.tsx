import { useGame } from '@/game'
import Artwork from '@/shared/artwork'
import { cn } from '@/utils'
import { EnemyCard, getEncounterCard, getMatchingAction } from '@lumos/game'
import { ActionTooltip } from '@/shared/action-tooltip'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { EnemyDetails } from './enemy-details'

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
    {
      type: 'choose',
      enemyIndex,
    },
  ])

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger>
        <ActionTooltip action={action}>
          <div
            className={cn(
              'relative flex justify-center',
              action && 'cursor-pointer'
            )}
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
        </ActionTooltip>
      </TooltipTrigger>
      <TooltipContent
        sideOffset={20}
        className="z-40 p-0 border-0 cursor-default"
      >
        <EnemyDetails enemyIndex={enemyIndex} />
      </TooltipContent>
    </Tooltip>
  )
}

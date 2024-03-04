import { useGame } from '@/game'
import Artwork from '@/shared/artwork'
import { AttributeItem } from '@/shared/attribute-item'
import { cn } from '@/utils'
import { getMatchingAction } from '@lumos/game'

export function DoomOverview() {
  const { context, phase, actions } = useGame()
  const { doomState } = context
  const { doomCard, doom } = doomState

  const failed = phase.type === 'advanceDoom'

  const action = getMatchingAction(actions, [
    {
      type: 'advanceDoom',
    },
  ])

  return (
    <div
      className={cn(
        'relative rounded border-2 shadow w-96 h-48 text-stone-800 bg-stone-300 border-stone-600 transition-transform duration-300 ease-out',
        action &&
          'cursor-pointer outline outline-blue-400 bg-blue-200 border-blue-400',
        failed && 'scale-125 origin-top z-10'
      )}
      onClick={action?.execute}
    >
      <Artwork
        id="bg-card"
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />
      <div className="relative grid grid-cols-5 h-full">
        <div className="col-span-3 grid gap-2 p-3">
          <h2>{doomCard.name}</h2>
          {failed ? (
            <p className="text-xs">{doomCard.consequence}</p>
          ) : (
            <p className="text-xs">{doomCard.story}</p>
          )}
          <div className="flex gap-2 items-center">
            <AttributeItem attribute="doom" value={doom} />
            /
            <AttributeItem attribute="doom" value={doomCard.treshold} />
          </div>
        </div>
        <Artwork
          key={doomCard.id}
          id={doomCard.id}
          className="h-full object-cover col-span-2"
        />
      </div>
    </div>
  )
}

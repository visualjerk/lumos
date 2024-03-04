import { useGame } from '@/game'
import Artwork from '@/shared/artwork'
import { AttributeItem } from '@/shared/attribute-item'
import { cn } from '@/utils'
import { getMatchingAction } from '@lumos/game'

export function SceneOverview() {
  const { context, phase, actions } = useGame()
  const { sceneState } = context
  const { sceneCard } = sceneState

  const solved = phase.type === 'advanceScene'

  const action = getMatchingAction(actions, [
    {
      type: 'solveScene',
    },
    {
      type: 'advanceScene',
    },
  ])

  return (
    <div
      className={cn(
        'relative rounded border-2 shadow w-96 h-48 text-stone-800 bg-stone-300 border-stone-600 duration-300 ease-out',
        action &&
          'cursor-pointer outline outline-blue-400 bg-blue-200 border-blue-400',
        solved && 'scale-125 origin-top z-10'
      )}
      onClick={action?.execute}
    >
      <Artwork
        id="bg-card"
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />
      <div className="relative grid grid-cols-5 h-full">
        <Artwork
          key={sceneCard.id}
          id={sceneCard.id}
          className="h-full object-cover col-span-2"
        />
        <div className="col-span-3 grid gap-2 p-3">
          <h2>{sceneCard.name}</h2>
          {solved ? (
            <p className="text-xs">{sceneCard.consequence}</p>
          ) : (
            <>
              <p className="text-xs">{sceneCard.story}</p>
              <p className="text-xs italic">
                Collect{' '}
                <AttributeItem
                  attribute="clues"
                  value={sceneCard.clueTreshold}
                />{' '}
                to move on to the next scene.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

import { getMatchingAction } from '@lumos/game'
import ActionButton from '@/shared/action-button'
import { useGame } from '@/game'
import Artwork from '@/shared/artwork'
import { EncounterCard } from './encounter-card'

export function EncounterOverlay() {
  const { phase, actions } = useGame()

  if (phase.type !== 'drawEncounterEffect') {
    return
  }

  const { encounterCard } = phase

  const action = getMatchingAction(actions, [
    {
      type: 'confirm',
    },
  ])

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-30">
      <div className="relative bg-stone-500 border-2 rounded border-stone-700 shadow-lg">
        <Artwork
          id="bg-stone"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="relative grid gap-3 p-4 text-stone-100">
          <h2 className="text-2xl">Encounter</h2>
          {encounterCard && <EncounterCard card={encounterCard} />}
          {action && (
            <ActionButton onClick={action?.execute}>{action.type}</ActionButton>
          )}
        </div>
      </div>
    </div>
  )
}

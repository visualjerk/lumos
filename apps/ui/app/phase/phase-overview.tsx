import { useGame } from '@/game'
import ActionButton from '@/shared/action-button'
import Artwork from '@/shared/artwork'
import { getMatchingAction } from '@lumos/game'

export function PhaseOverview() {
  const { phase, parentPhase, actions } = useGame()

  const action = getMatchingAction(actions, [
    {
      type: 'end',
    },
    {
      type: 'increaseDoom',
    },
    {
      type: 'drawEncounter',
    },
    {
      type: 'confirm',
    },
  ])

  return (
    <div className="relative bg-stone-600 border-2 rounded border-stone-800 text-stone-100 shadow-lg">
      <Artwork
        id="bg-stone"
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />
      <div className="relative grid grid-cols-2 gap-2 w-80 h-40 p-4">
        <h2 className="grid content-center">
          <span className="text-xs">Current Phase</span>
          <span className="text-xl">{phase.type}</span>
          <span className="text-xs">({parentPhase.type})</span>
        </h2>
        <ActionButton onClick={action?.execute} disabled={!action}>
          Next
        </ActionButton>
      </div>
      <div className="relative flex gap-2 flex-wrap p-4 w-80">
        {actions.map((action, index) => (
          <ActionButton onClick={action.execute} key={index}>
            {action.type}
          </ActionButton>
        ))}
      </div>
    </div>
  )
}

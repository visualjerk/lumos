import { useGame } from '@/game'
import ActionButton from '@/shared/action-button'
import Artwork from '@/shared/artwork'
import { getMatchingAction } from '@lumos/game'

export function PhaseOverview() {
  const { phase, parentPhase, actions, undo, canUndo } = useGame()

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
    <div className="relative bg-stone-600 border-2 rounded border-stone-800 text-stone-100 shadow-lg w-96 p-4 grid gap-2">
      <Artwork
        id="bg-stone"
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />
      <div className="relative grid grid-cols-2 gap-2 h-40">
        <div className="flex flex-col gap-2 justify-between">
          <h2 className="grid content-start">
            <span className="text-xs">Current Phase</span>
            <span className="capitalize">{phase.type}</span>
            <span className="capitalize text-xs">({parentPhase.type})</span>
          </h2>
          {parentPhase.type === 'investigator' && (
            <p>{3 - parentPhase.actionsMade} actions left</p>
          )}
        </div>
        <div className="grid gap-2">
          <ActionButton onClick={action?.execute} disabled={!action}>
            Next
          </ActionButton>
          <ActionButton onClick={undo} disabled={!canUndo}>
            Undo
          </ActionButton>
        </div>
      </div>
    </div>
  )
}

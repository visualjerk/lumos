import {
  Context,
  Investigator,
  PublicPhaseAction,
  getMatchingAction,
} from '@lumos/game'
import ActionButton from '../action-button'

export type InvestigatorDeckProps = {
  investigator: Investigator
  context: Context
  actions: PublicPhaseAction[]
}

export default function InvestigatorDeck({
  investigator,
  context,
  actions,
}: InvestigatorDeckProps) {
  const state = context.getInvestigatorState(investigator.id)
  const { deck } = state

  const drawAction = getMatchingAction(actions, {
    type: 'draw',
    investigatorId: investigator.id,
  })

  return (
    <div className="p-4 relative rounded bg-stone-500 text-stone-100 border border-stone-600 shadow w-40 h-52">
      <div className="text-xs bg-stone-700 rounded-full absolute top-1 right-1 p-1 px-2 font-semibold">
        {deck.length}
      </div>
      {drawAction && (
        <ActionButton onClick={() => drawAction.execute()}>Draw</ActionButton>
      )}
    </div>
  )
}

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
    <div className="rounded bg-stone-500 text-stone-100 border border-stone-600 shadow p-2 grid gap-3">
      <div className="flex items-center gap-2">
        Deck
        <div className="bg-stone-700 rounded-full p-1 px-2 font-semibold">
          {deck.length}
        </div>
      </div>
      <ActionButton onClick={drawAction?.execute} disabled={!drawAction}>
        Draw
      </ActionButton>
    </div>
  )
}

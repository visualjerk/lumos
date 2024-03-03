import { getMatchingAction } from '@lumos/game'
import ActionButton from '@/shared/action-button'
import { useGame } from '@/game'

export default function InvestigatorDeck() {
  const { investigator, context, actions } = useGame()
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

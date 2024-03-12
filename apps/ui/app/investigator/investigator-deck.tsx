import { getMatchingAction } from '@lumos/game'
import ActionButton from '@/shared/action-button'
import { useGame } from '@/game'
import Artwork from '@/shared/artwork'

export default function InvestigatorDeck() {
  const { investigator, context, actions } = useGame()
  const state = context.getInvestigatorState(investigator.id)
  const { deck } = state

  const drawAction = getMatchingAction(actions, {
    type: 'draw',
  })

  return (
    <div className="relative rounded bg-stone-500 text-stone-100 border-2 border-stone-700 shadow">
      <Artwork
        id="bg-stone"
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />
      <div className="relative p-4 grid gap-3">
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
    </div>
  )
}

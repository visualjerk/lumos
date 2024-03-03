import { useGame } from '@/game'

export default function InvestigatorDiscardPile() {
  const { investigator, context } = useGame()
  const state = context.getInvestigatorState(investigator.id)
  const { discardPile } = state

  return (
    <div className="rounded bg-stone-500 text-stone-100 border border-stone-600 shadow flex items-center gap-2 p-2">
      Discard Pile
      <div className="bg-stone-700 rounded-full p-1 px-2 font-semibold">
        {discardPile.length}
      </div>
    </div>
  )
}

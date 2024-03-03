import { useGame } from '@/game'
import Artwork from '@/shared/artwork'

export default function InvestigatorDiscardPile() {
  const { investigator, context } = useGame()
  const state = context.getInvestigatorState(investigator.id)
  const { discardPile } = state

  return (
    <div className="relative rounded bg-stone-500 text-stone-100 border-2 border-stone-700 shadow">
      <Artwork
        id="bg-stone"
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />
      <div className="relative p-4 flex items-center gap-2">
        Discard Pile
        <div className="bg-stone-700 rounded-full p-1 px-2 font-semibold">
          {discardPile.length}
        </div>
      </div>
    </div>
  )
}

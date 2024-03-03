import { Context, Investigator } from '@lumos/game'
import InvestigatorCard from './investigator-card'

export type InvestigatorDiscardPileProps = {
  investigator: Investigator
  context: Context
}

export default function InvestigatorDiscardPile({
  investigator,
  context,
}: InvestigatorDiscardPileProps) {
  const state = context.getInvestigatorState(investigator.id)
  const { discardPile } = state

  const topCard = discardPile.at(-1)

  return (
    <div className="relative rounded bg-stone-500 text-stone-100 border border-stone-600 shadow w-40 h-52 grid gap-2">
      <div className="text-xs bg-stone-700 rounded-full absolute top-1 right-1 p-1 px-2 font-semibold">
        {discardPile.length}
      </div>
      {topCard && <InvestigatorCard id={topCard} index={0} actions={[]} />}
    </div>
  )
}

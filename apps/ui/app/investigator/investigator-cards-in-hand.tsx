import { Context, Investigator, PublicPhaseAction } from '@lumos/game'
import InvestigatorCard from './investigator-card'

export type InvestigatorCardsInHandProps = {
  investigator: Investigator
  context: Context
  actions: PublicPhaseAction[]
}

export default function InvestigatorCardsInHand({
  investigator,
  context,
  actions,
}: InvestigatorCardsInHandProps) {
  const state = context.getInvestigatorState(investigator.id)
  const { cardsInHand } = state

  let center = cardsInHand.length / 2

  if (center % 2 === 0) {
    center += 0.5
  }

  function cardStyle(index: number) {
    const position = index + 1

    // TODO: fix positioning
    const rotation = (position - center) * 2
    const translateY = Math.abs((position - center) * 6)

    return {
      transform: `rotate(${rotation}deg) translateY(${translateY}px)`,
    }
  }

  return (
    <div
      className="grid w-96"
      style={{
        gridTemplateColumns: 'repeat(auto-fit,  minmax(10px, max-content))',
      }}
    >
      {cardsInHand.map((id, index) => (
        <div key={index} className="rotate-3" style={cardStyle(index)}>
          <InvestigatorCard
            key={index}
            id={id}
            index={index}
            actions={actions}
          />
        </div>
      ))}
    </div>
  )
}

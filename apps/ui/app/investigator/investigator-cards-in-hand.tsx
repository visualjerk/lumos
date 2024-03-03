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

  return (
    <div
      className="grid w-96"
      style={{
        gridTemplateColumns: 'repeat(auto-fit,  minmax(10px, max-content))',
      }}
    >
      {cardsInHand.map((id, index) => (
        <div key={index} style={cardStyle(index, cardsInHand.length)}>
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

function cardStyle(index: number, totalCards: number) {
  const center = (totalCards + 1) / 2
  const position = index + 1
  const diff = position - center

  const rotation = diff * 3
  const translateY = Math.abs(diff * 0.3)

  return {
    transform: `rotate(${rotation}deg) translateY(${translateY}rem)`,
  }
}

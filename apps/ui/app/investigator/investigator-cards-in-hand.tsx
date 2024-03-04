import { InvestigatorCardId, PublicPhaseAction } from '@lumos/game'
import { useCss } from 'react-use'
import InvestigatorCard from './investigator-card'
import { useGame } from '@/game'

export default function InvestigatorCardsInHand() {
  const { investigator, context, actions } = useGame()

  const state = context.getInvestigatorState(investigator.id)
  const { cardsInHand } = state

  return (
    <div
      className="grid w-96 h-60"
      style={{
        gridTemplateColumns: 'repeat(auto-fit,  minmax(10px, max-content))',
      }}
    >
      {cardsInHand.map((id, index) => (
        <CardInHand
          key={`${id}-${index}`}
          id={id}
          index={index}
          totalCards={cardsInHand.length}
          actions={actions}
        />
      ))}
    </div>
  )
}

export type CardInHandProps = {
  id: InvestigatorCardId
  index: number
  totalCards: number
  actions: PublicPhaseAction[]
}

function CardInHand({ id, index, totalCards, actions }: CardInHandProps) {
  const center = (totalCards + 1) / 2
  const position = index + 1
  const diff = position - center

  const rotation = diff * 3
  const translateY = Math.abs(diff * 0.3)

  const className = useCss({
    transform: `rotate(${rotation}deg) translateY(${translateY}rem)`,
    '&:hover': {
      transition: 'transform 0.3s',
      transform: `scale(1.3) translateY(-3rem)`,
      zIndex: 100,
    },
  })

  return (
    <div className={className}>
      <InvestigatorCard id={id} index={index} actions={actions} />
    </div>
  )
}

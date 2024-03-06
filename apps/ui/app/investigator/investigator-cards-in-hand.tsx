'use client'

import { InvestigatorCardId, PublicPhaseAction } from '@lumos/game'
import InvestigatorCard from './investigator-card'
import { useGame } from '@/game'

export default function InvestigatorCardsInHand() {
  const { investigator, context, actions } = useGame()

  const state = context.getInvestigatorState(investigator.id)
  const { cardsInHand } = state

  return (
    <div
      className="grid w-96 h-72"
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

  return (
    <div
      className="translate-y-[--card-translate-y] rotate-[--card-rotate] hover:duration-300 hover:transition-transform hover:scale-125 hover:-translate-y-12 hover:rotate-0 hover:z-10"
      style={{
        // @ts-expect-error - css variables not typed in react
        '--card-rotate': `${rotation}deg`,
        '--card-translate-y': `${translateY}rem`,
      }}
    >
      <InvestigatorCard id={id} index={index} actions={actions} />
    </div>
  )
}

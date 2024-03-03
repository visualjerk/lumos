import { InvestigatorCardId } from '@lumos/game'
import { useCss } from 'react-use'
import InvestigatorCard from './investigator-card'

export type InvestigatorCardStackProps = {
  ids: InvestigatorCardId[]
}

export default function InvestigatorCardStack({
  ids,
}: InvestigatorCardStackProps) {
  return (
    <div className="h-52 w-40">
      <div
        className="grid h-32"
        style={{
          gridTemplateRows: 'repeat(auto-fit,  minmax(10px, max-content))',
        }}
      >
        {ids.map((id, index) => (
          <CardInStack key={index} id={id} index={index} />
        ))}
      </div>
    </div>
  )
}

export type CardInStackProps = {
  id: InvestigatorCardId
  index: number
}

function CardInStack({ id, index }: CardInStackProps) {
  const className = useCss({
    transform: `scale(0.8) rotate(-3deg)`,
    transition: 'transform 0.3s',
    '&:hover': {
      transform: `scale(1.3) translateY(-3rem)`,
      zIndex: 100,
    },
  })

  return (
    <div key={index} className={className}>
      <InvestigatorCard key={index} id={id} index={index} actions={[]} />
    </div>
  )
}

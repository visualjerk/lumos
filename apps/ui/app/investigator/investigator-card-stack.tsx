import { InvestigatorCardId } from '@lumos/game'
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
          <CardInStack key={`${id}-${index}`} id={id} index={index} />
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
  return (
    <div
      key={index}
      className="scale-75 -rotate-3 duration-300 hover:transition-transform hover:scale-125 hover:rotate-0 hover:-translate-y-12 hover:z-10"
    >
      <InvestigatorCard key={index} id={id} index={index} actions={[]} />
    </div>
  )
}

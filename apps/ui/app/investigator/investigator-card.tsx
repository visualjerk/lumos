import { InvestigatorCardId, Skill, getInvestigatorCard } from '@lumos/game'
import Artwork from '../shared/artwork'
import { AttributeItem } from '../shared/attribute-item'

export type InvestigatorCardProps = {
  id: InvestigatorCardId
}

export default function InvestigatorCard({ id }: InvestigatorCardProps) {
  const card = getInvestigatorCard(id)

  const skills = Object.entries(card.skillModifier).map(([skill, value]) => ({
    skill: skill as Skill,
    value,
  }))

  return (
    <div className="bg-stone-300 rounded border border-stone-400 shadow w-40">
      <h3 className="p-2 leading-none">{card.name}</h3>
      <Artwork id={id} className="object-cover w-full aspect-video" />
      <div className="p-2 flex gap-4">
        {skills.map(({ skill, value }) => (
          <AttributeItem key={skill} attribute={skill} value={value} />
        ))}
      </div>
      <div className="p-2">
        <div className="text-sm">{card.description}</div>
      </div>
    </div>
  )
}

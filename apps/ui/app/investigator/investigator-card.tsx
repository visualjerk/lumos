import {
  InvestigatorCardId,
  PublicPhaseAction,
  Skill,
  getInvestigatorCard,
  getMatchingAction,
} from '@lumos/game'
import Artwork from '../shared/artwork'
import { AttributeItem } from '../shared/attribute-item'
import { classNames } from '../utils'

export type InvestigatorCardProps = {
  id: InvestigatorCardId
  index: number
  actions: PublicPhaseAction[]
}

export default function InvestigatorCard({
  id,
  index,
  actions,
}: InvestigatorCardProps) {
  const card = getInvestigatorCard(id)

  const skills = Object.entries(card.skillModifier).map(([skill, value]) => ({
    skill: skill as Skill,
    value,
  }))

  const playAction = getMatchingAction(actions, {
    type: 'play',
    cardIndex: index,
  })

  function handleClick() {
    if (playAction) {
      playAction.execute()
    }
  }

  return (
    <div
      className={classNames(
        'rounded border shadow w-40',
        playAction
          ? 'cursor-pointer outline outline-blue-400 bg-blue-50 border-blue-300'
          : 'bg-stone-300 border-stone-400'
      )}
      onClick={handleClick}
    >
      <h3 className="p-2 leading-none">{card.name}</h3>
      <Artwork id={id} className="object-cover w-full aspect-video" />
      <div className="p-2 flex gap-4">
        {skills.map(({ skill, value }) => (
          <AttributeItem key={skill} attribute={skill} value={value} />
        ))}
      </div>
      <div className="p-2">
        <div className="text-xs">{card.description}</div>
      </div>
    </div>
  )
}

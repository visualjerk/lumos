import {
  InvestigatorCardId,
  PublicPhaseAction,
  Skill,
  getInvestigatorCard,
  getMatchingAction,
} from '@lumos/game'
import Artwork from '../shared/artwork'
import { AttributeItem } from '../shared/attribute-item'
import { cn } from '../utils'
import { SparklesCore } from '../shared/sparkles'
import { useHoverDirty } from 'react-use'
import { useRef } from 'react'

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
  const ref = useRef(null)
  const isHovered = useHoverDirty(ref)

  const skills = Object.entries(card.skillModifier).map(([skill, value]) => ({
    skill: skill as Skill,
    value,
  }))

  let action = getMatchingAction(actions, {
    type: 'play',
    cardIndex: index,
  })

  if (!action) {
    action = getMatchingAction(actions, {
      type: 'addToSkillCheck',
      cardIndex: index,
    })
  }

  function handleClick() {
    if (action) {
      action.execute()
    }
  }

  return (
    <div
      ref={ref}
      className={cn(
        'rounded border shadow w-40 h-52 text-stone-800',
        action
          ? 'cursor-pointer outline outline-blue-400 bg-blue-50 border-blue-300'
          : 'bg-stone-300 border-stone-400'
      )}
      onClick={handleClick}
    >
      <h3 className="p-2 leading-none">{card.name}</h3>
      <div className="relative">
        <Artwork id={id} className="object-cover w-full aspect-video" />
        {isHovered && (
          <SparklesCore
            id={`investigator-card-${index}`}
            background="transparent"
            minSize={0.4}
            maxSize={1}
            particleDensity={1200}
            className="absolute inset-0"
            particleColor="#FFFFFF"
          />
        )}
      </div>
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

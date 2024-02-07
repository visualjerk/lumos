import { Skills } from '@lumos/game'
import { GameInvestigatorCard } from './use-game'
import ActionButton from './action-button'
import { SKILL_ICONS } from './skill-icons'

export default function RevealedInvestigatorCard({
  card,
}: {
  card: GameInvestigatorCard
}) {
  return (
    <div className="flex flex-col gap-3 bg-white p-3 w-36">
      <div>{card.name}</div>
      <div className="flex flex-row gap-3">
        {Object.entries(card.skillModifier).map(([skill, value]) => (
          <div key={skill}>
            {SKILL_ICONS[skill as keyof Skills].repeat(value)}
          </div>
        ))}
      </div>
      <div className="text-sm">{card.description}</div>
      {card.actions.map((action, index) => (
        <ActionButton key={index} onClick={() => action.execute()}>
          {action.type}
        </ActionButton>
      ))}
    </div>
  )
}

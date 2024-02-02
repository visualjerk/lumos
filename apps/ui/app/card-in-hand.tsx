import { Skills } from '@lumos/game'
import { GameInvestigatorCard } from './use-game'

const SKILL_ICONS: Record<keyof Skills, string> = {
  intelligence: '🧠',
  strength: '💪',
  agility: '🏃',
}

export function CardInHand({ card }: { card: GameInvestigatorCard }) {
  return (
    <div className="grid gap-3 bg-white p-3 w-36">
      <div>{card.name}</div>
      <div className="flex flex-row gap-3">
        {Object.entries(card.skillModifier).map(([skill, value]) => (
          <div key={skill}>
            {SKILL_ICONS[skill as keyof Skills].repeat(value)}
          </div>
        ))}
      </div>
      {card.actions.map((action, index) => (
        <button
          key={index}
          onClick={() => action.execute()}
          className="p-1 bg-gray-200"
        >
          {action.type}
        </button>
      ))}
    </div>
  )
}
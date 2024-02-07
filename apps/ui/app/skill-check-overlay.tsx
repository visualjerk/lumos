import { GamePhaseOf, SkillCheckPhase, getInvestigatorCard } from '@lumos/game'
import ActionButton from './action-button'
import { GameInvestigator } from './use-game'
import RevealedInvestigatorCard from './revealed-investigator-card'

export default function SkillCheckOverlay({
  phase,
  investigator,
}: {
  phase: GamePhaseOf<SkillCheckPhase>
  investigator: GameInvestigator
}) {
  const { skillCheckContext, actions } = phase
  const { check, addedCards, skillModifier, difficulty } = skillCheckContext
  const cards = addedCards.map((cardId) => getInvestigatorCard(cardId))

  const filteredActions = actions.filter(
    (action) => action.type === 'commitSkillCheck'
  )

  return (
    <div className="grid gap-3">
      <h2 className="text-xl">Skillcheck {check.skill}</h2>
      <div className="flex flex-row gap-3">
        <div>
          Skill: {investigator.skills[check.skill]} + {skillModifier}
        </div>
        <div>Difficulty: {difficulty}</div>
      </div>
      <div className="flex gap-3 bg-gray-50 p-3">
        {cards.map((card, index) => (
          <RevealedInvestigatorCard
            key={index}
            card={{ ...card, actions: [] }}
          />
        ))}
      </div>
      {filteredActions.map((action, index) => (
        <ActionButton key={index} onClick={() => action.execute()}>
          {action.type}
        </ActionButton>
      ))}
    </div>
  )
}

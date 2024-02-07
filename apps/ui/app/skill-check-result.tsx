import {
  CommitSkillCheckPhase,
  GamePhaseOf,
  getInvestigatorCard,
} from '@lumos/game'
import ActionButton from './action-button'
import RevealedInvestigatorCard from './revealed-investigator-card'

export default function SkillCheckResult({
  phase,
}: {
  phase: GamePhaseOf<CommitSkillCheckPhase>
}) {
  const { skillCheckContext, actions } = phase
  const { addedCards, totalSkill, fate, difficulty } = skillCheckContext
  const cards = addedCards.map((cardId) => getInvestigatorCard(cardId))

  return (
    <div className="grid gap-3">
      <div className="flex flex-row gap-3">
        <div>{totalSkill < difficulty ? '❌' : '✅'}</div>
        <div>Skill: {totalSkill}</div>
        <div>Difficulty: {difficulty}</div>
        <div>Fate: {fate.symbol}</div>
      </div>
      <div className="flex gap-3 bg-gray-50 p-3">
        {cards.map((card, index) => (
          <RevealedInvestigatorCard
            key={index}
            card={{ ...card, actions: [] }}
          />
        ))}
      </div>
      {actions.map((action, index) => (
        <ActionButton key={index} onClick={() => action.execute()}>
          {action.type}
        </ActionButton>
      ))}
    </div>
  )
}

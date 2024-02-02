import { CommitInvestigationSkillCheckPhase, GamePhaseOf } from '@lumos/game'

export function SkillCheckResult({
  phase,
}: {
  phase: GamePhaseOf<CommitInvestigationSkillCheckPhase>
}) {
  const { skillCheckContext, actions } = phase
  return (
    <div className="grid gap-3">
      <div className="flex flex-row gap-3">
        <div>
          {skillCheckContext.skill < skillCheckContext.difficulty ? '❌' : '✅'}
        </div>
        <div>Skill: {skillCheckContext.skill}</div>
        <div>Difficulty: {skillCheckContext.difficulty}</div>
        <div>Fate: {skillCheckContext.fate.symbol}</div>
      </div>
      {actions.map((action, index) => (
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

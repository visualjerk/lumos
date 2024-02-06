import { CommitSkillCheckPhase, GamePhaseOf } from '@lumos/game'
import ActionButton from './action-button'

export default function SkillCheckResult({
  phase,
}: {
  phase: GamePhaseOf<CommitSkillCheckPhase>
}) {
  const { skillCheckContext, actions } = phase
  return (
    <div className="grid gap-3">
      <div className="flex flex-row gap-3">
        <div>
          {skillCheckContext.totalSkill < skillCheckContext.difficulty
            ? '❌'
            : '✅'}
        </div>
        <div>Skill: {skillCheckContext.totalSkill}</div>
        <div>Difficulty: {skillCheckContext.difficulty}</div>
        <div>Fate: {skillCheckContext.fate.symbol}</div>
      </div>
      {actions.map((action, index) => (
        <ActionButton key={index} onClick={() => action.execute()}>
          {action.type}
        </ActionButton>
      ))}
    </div>
  )
}

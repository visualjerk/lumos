import {
  CommitSkillCheckPhase,
  PublicPhaseAction,
  PublicPhaseOf,
  SkillCheckPhase,
  getMatchingAction,
} from '@lumos/game'
import GameIcon from '../shared/game-icon'
import ActionButton from '../shared/action-button'
import { cn } from '../utils'
import InvestigatorCardStack from '../investigator/investigator-card-stack'

export type SkillCheckOverlayProps = {
  phase: PublicPhaseOf<SkillCheckPhase> | PublicPhaseOf<CommitSkillCheckPhase>
  actions: PublicPhaseAction[]
}

export default function SkillCheckOverlay({
  phase,
  actions,
}: SkillCheckOverlayProps) {
  const { skillCheckContext, totalSkill } = phase
  const { check, addedCards } = skillCheckContext
  const { skill, difficulty } = check

  const action = getMatchingAction(actions, [
    {
      type: 'commitSkillCheck',
    },
    {
      type: 'endSkillCheck',
    },
  ])

  const fate = phase.type === 'commitSkillCheck' ? phase.fate.symbol : '?'

  function getState() {
    if (phase.type !== 'commitSkillCheck') {
      return 'check'
    }
    return difficulty <= totalSkill ? 'success' : 'failure'
  }

  const stateClasses = {
    check: 'bg-stone-300 border-stone-400',
    success: 'bg-green-50 border-green-400',
    failure: 'bg-red-50 border-red-400',
  }

  return (
    <div className="fixed inset-0 flex justify-center items-center pointer-events-none">
      <div className="flex items-center gap-3 pointer-events-auto">
        <InvestigatorCardStack ids={addedCards} />
        <div
          className={cn(
            'grid gap-3 p-4 rounded-sm border-2 shadow-xl',
            stateClasses[getState()]
          )}
        >
          <h2 className="text-2xl">
            <GameIcon kind={skill} /> {skill} Check
          </h2>
          <div className="text-4xl text-center">
            {totalSkill} vs {difficulty}
          </div>
          {action && (
            <ActionButton onClick={() => action.execute()}>
              {action.type}
            </ActionButton>
          )}
        </div>
        <div className="w-40">
          <h3 className="text-xl">Fate</h3>
          <div className="text-4xl">{fate}</div>
        </div>
      </div>
    </div>
  )
}

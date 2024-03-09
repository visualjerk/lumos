import { getMatchingAction } from '@lumos/game'
import GameIcon from '@/shared/game-icon'
import ActionButton from '@/shared/action-button'
import { cn } from '@/utils'
import InvestigatorCardStack from '@/investigator/investigator-card-stack'
import { useGame } from '@/game'
import Artwork from '@/shared/artwork'

export default function SkillCheckOverlay() {
  const { phase, actions } = useGame()

  if (phase.type !== 'skillCheck' && phase.type !== 'commitSkillCheck') {
    return
  }

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
    check: 'bg-stone-500 border-stone-700',
    success: 'bg-green-500 border-green-700',
    failure: 'bg-red-500 border-red-700',
  }

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-30">
      <div className="flex items-center gap-3">
        <InvestigatorCardStack ids={addedCards} />
        <div
          className={cn(
            'relative rounded border-2 shadow-xl',
            stateClasses[getState()]
          )}
        >
          <Artwork
            id="bg-stone"
            className="absolute inset-0 w-full h-full object-cover opacity-40 rounded"
          />
          <div className="relative grid gap-3 p-4 text-stone-100">
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
        </div>
        <div className="relative rounded bg-stone-700 text-stone-100 border-2 border-stone-900 shadow-xl">
          <Artwork
            id="bg-stone"
            className="absolute inset-0 w-full h-full object-cover opacity-40 rounded"
          />
          <div className="w-40 p-4 relative text-stone-100 text-center">
            <h3 className="text-xl">Fate</h3>
            <div className="text-4xl">{fate}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

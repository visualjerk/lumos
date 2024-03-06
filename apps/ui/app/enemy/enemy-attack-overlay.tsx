import { getMatchingAction } from '@lumos/game'
import ActionButton from '@/shared/action-button'
import { useGame } from '@/game'
import Artwork from '@/shared/artwork'
import { EnemyCard } from './enemy-card'

export function EnemyAttackOverlay() {
  const { phase, actions } = useGame()

  if (phase.type !== 'enemyAttackEffect') {
    return
  }

  const { enemyCard } = phase

  if (!enemyCard) {
    return
  }

  const action = getMatchingAction(actions, [
    {
      type: 'confirm',
    },
  ])

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-30">
      <div className="relative bg-stone-500 border-2 rounded border-stone-700 shadow-lg">
        <Artwork
          id="bg-stone"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="relative grid gap-3 p-4 text-stone-100">
          <h2 className="text-2xl text-center">You Are Attacked</h2>
          <div className="flex justify-center">
            <EnemyCard card={enemyCard} />
          </div>
          {action && (
            <ActionButton onClick={action?.execute}>{action.type}</ActionButton>
          )}
        </div>
      </div>
    </div>
  )
}

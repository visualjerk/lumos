import { GamePhaseOf, EnemyAttackPhase } from '@lumos/game'
import ActionButton from './action-button'

export default function EnemyAttackOverlay({
  phase,
}: {
  phase: GamePhaseOf<EnemyAttackPhase>
}) {
  const { context, actions, enemyAttackContext } = phase

  const engagedEnemy = context.getReadyEngangedEnemy(
    enemyAttackContext.investigatorId
  )!
  const enemyCard = context.getEnemyCard(engagedEnemy.cardId)

  return (
    <div className="grid gap-3">
      <h2 className="text-xl">{enemyCard.name} attacks you</h2>
      <div>🔥 {engagedEnemy.attackDamage}</div>
      {actions.map((action, index) => (
        <ActionButton key={index} onClick={() => action.execute()}>
          {action.type}
        </ActionButton>
      ))}
    </div>
  )
}

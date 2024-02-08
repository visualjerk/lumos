import ActionButton from './action-button'
import { GameEnemy } from './use-game'

export default function LocationEnemy({ enemy }: { enemy: GameEnemy }) {
  return (
    <div className="flex flex-col gap-1 bg-white p-2">
      <div className=" text-red-600">{enemy.name}</div>
      <div className="flex flex-row gap-1 text-sm">
        <div>
          🔥 {enemy.damage} / ❤️ {enemy.health}
        </div>
        <div>💪 {enemy.strength}</div>
      </div>
      {enemy.actions.map((action, index) => (
        <ActionButton key={index} onClick={() => action.execute()}>
          {action.type}
        </ActionButton>
      ))}
    </div>
  )
}

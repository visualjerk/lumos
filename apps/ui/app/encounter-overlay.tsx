import {
  GamePhaseOf,
  HandleEncounterPhase,
  getEncounterCard,
} from '@lumos/game'
import ActionButton from './action-button'

export default function EncounterOverlay({
  phase,
}: {
  phase: GamePhaseOf<HandleEncounterPhase>
}) {
  const { context, actions } = phase
  const encounter = getEncounterCard(
    context,
    context.encounterState.currentCardId!
  )

  return (
    <div className="grid gap-3">
      <div className="flex flex-row gap-3">
        <div>{encounter.name}</div>
      </div>
      {actions.map((action, index) => (
        <ActionButton key={index} onClick={() => action.execute()}>
          {action.type}
        </ActionButton>
      ))}
    </div>
  )
}

import { GamePhaseOf, HandleEncounterPhase } from '@lumos/game'
import ActionButton from './action-button'

export default function EncounterOverlay({
  phase,
}: {
  phase: GamePhaseOf<HandleEncounterPhase>
}) {
  const { context, actions } = phase
  const encounter = context.getEncounterCard(
    context.encounterState.currentCardId!
  )

  return (
    <div className="grid gap-3">
      <h2 className="text-xl">{encounter.name}</h2>
      <div>{encounter.description}</div>
      {actions.map((action, index) => (
        <ActionButton key={index} onClick={() => action.execute()}>
          {action.type}
        </ActionButton>
      ))}
    </div>
  )
}

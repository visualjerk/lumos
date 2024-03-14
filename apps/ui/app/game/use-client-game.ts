import {
  Context,
  Investigator,
  InvestigatorId,
  PublicGame,
  PublicPhase,
  PublicPhaseAction,
  Scenario,
  createInitialPublicGame,
} from '@lumos/game'
import { useEffect, useRef, useState } from 'react'

export function useClientGame(
  scenario: Scenario,
  investigators: Investigator[],
  controllerId: InvestigatorId
) {
  const game = useRef<PublicGame>()
  if (!game.current) {
    game.current = createInitialPublicGame(scenario, investigators)
  }

  const [clientGame, setClientGame] = useState(
    projectGame(game.current, controllerId)
  )

  useEffect(
    () =>
      game.current!.onChange(() => {
        setClientGame(projectGame(game.current!, controllerId))
      }),
    [controllerId]
  )

  useEffect(() => {
    setClientGame(projectGame(game.current!, controllerId))
  }, [controllerId])

  return clientGame
}

export type ProjectedGame = {
  phase: PublicPhase
  parentPhase: PublicPhase
  actions: PublicPhaseAction[]
  context: Context
  undo: () => void
  canUndo: boolean
  investigator: Investigator
}

function projectGame(
  game: PublicGame,
  controllerId: InvestigatorId
): ProjectedGame {
  const { phase, parentPhase, actions, context, canUndo } = game

  return {
    phase,
    parentPhase,
    actions: actions.filter(
      (action) =>
        action.controllerId == null || action.controllerId === controllerId
    ),
    context,
    undo: () => game.undo(),
    canUndo,
    investigator: context.getInvestigator(controllerId),
  }
}

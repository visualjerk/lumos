import {
  Investigator,
  PublicGame,
  PublicPhase,
  PublicPhaseAction,
  Scenario,
  createInitialPublicGame,
  Context,
} from '@lumos/game'
import { useEffect, useRef, useState } from 'react'

export function useInitialGame(
  scenario: Scenario,
  investigators: Investigator[]
) {
  const game = useRef<PublicGame>()
  if (!game.current) {
    game.current = createInitialPublicGame(scenario, investigators)
  }

  const [gameProjection, setGameProjection] = useState(
    projectGame(game.current)
  )

  useEffect(
    () =>
      game.current!.onChange(() => {
        setGameProjection(projectGame(game.current!))
      }),
    []
  )

  return gameProjection
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

function projectGame(game: PublicGame): ProjectedGame {
  const { phase, parentPhase, actions, context, canUndo } = game

  return {
    phase,
    parentPhase,
    actions,
    context,
    undo: () => game.undo(),
    canUndo,
    // TODO: Investigator should be selected by the user
    investigator: context.investigators[0],
  }
}
